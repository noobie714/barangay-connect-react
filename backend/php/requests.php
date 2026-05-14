<?php
// ============================================================
//  [Put the original filename here] 
// ============================================================

// Load central configuration
require_once __DIR__ . '/config.php';

// Start session (if needed)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_httponly', '1');
    session_start();
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Setup CORS for production
setupCORS();

// ── HELPERS ───────────────────────────────────────────────
function getJson(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function jsonOk(array $data = [], string $message = 'Success'): void {
    echo json_encode(['success' => true, 'message' => $message] + $data);
    exit;
}

function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function requireAuth(string $role = ''): array {
    $user = $_SESSION['user'] ?? null;
    if (!$user) {
        http_response_code(401);
        die(json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']));
    }
    if ($role && $user['role'] !== $role) {
        http_response_code(403);
        die(json_encode(['success' => false, 'message' => 'Forbidden. Insufficient permissions.']));
    }
    return $user;
}

function generateRefNo(): string {
    $pdo   = getDB();
    $year  = date('Y');
    $stmt  = $pdo->prepare("SELECT COUNT(*) FROM requests WHERE YEAR(created_at) = ?");
    $stmt->execute([$year]);
    $count = (int) $stmt->fetchColumn();
    return 'REQ-' . $year . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
}

// ── ROUTER ────────────────────────────────────────────────
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':      handleList();      break;
    case 'get':       handleGet();       break;
    case 'submit':    handleSubmit();    break;
    case 'status':    handleStatus();    break;
    case 'track':     handleTrack();     break;
    case 'doc_types': handleDocTypes();  break;
    default:          jsonError('Unknown action', 404);
}

// ── LIST ──────────────────────────────────────────────────
function handleList(): void {
    $user   = requireAuth();
    $pdo    = getDB();
    $params = [];
    $where  = [];

    if ($user['role'] === 'resident') {
        $where[]  = 'r.user_id = ?';
        $params[] = $user['id'];
    }

    $status = clean($_GET['status'] ?? '');
    if ($status && in_array($status, ['pending','processing','ready','completed','rejected'])) {
        $where[]  = 'r.status = ?';
        $params[] = $status;
    }

    $search = clean($_GET['search'] ?? '');
    if ($search) {
        $where[]  = '(r.reference_no LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR dt.name LIKE ?)';
        $like     = '%' . $search . '%';
        array_push($params, $like, $like, $like, $like);
    }

    $sql = "
        SELECT
            r.id, r.reference_no, r.status, r.fee, r.processing_type, r.urgent_fee,
            r.payment_method, r.payment_ref, r.payment_verified, r.purpose, r.reject_reason,
            DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date,
            CONCAT(u.first_name, ' ', u.last_name) AS resident_name,
            u.email AS resident_email,
            dt.name AS doc_name, dt.icon AS doc_icon
        FROM requests r
        JOIN users u ON u.id = r.user_id
        JOIN document_types dt ON dt.id = r.doc_type_id
    ";
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY r.created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonOk(['requests' => $stmt->fetchAll()]);
}

// ── GET single ────────────────────────────────────────────
function handleGet(): void {
    $user = requireAuth();
    $id   = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Request ID required.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT r.*, dt.name AS doc_name, dt.icon AS doc_icon, dt.fee AS doc_fee,
               CONCAT(u.first_name,' ',u.last_name) AS resident_name,
               u.email AS resident_email, u.phone AS resident_phone,
               u.address AS resident_address, u.purok AS resident_purok
        FROM requests r
        JOIN document_types dt ON dt.id = r.doc_type_id
        JOIN users u ON u.id = r.user_id
        WHERE r.id = ? LIMIT 1
    ");
    $stmt->execute([$id]);
    $req = $stmt->fetch();

    if (!$req) jsonError('Request not found.', 404);
    if ($user['role'] === 'resident' && $req['user_id'] != $user['id']) jsonError('Forbidden.', 403);
    jsonOk(['request' => $req]);
}

// ── SUBMIT new request ────────────────────────────────────
function handleSubmit(): void {
    $user = requireAuth('resident');
    $d    = getJson();

    $docTypeId      = (int)($d['doc_type_id']    ?? 0);
    $fullName       = clean($d['full_name']       ?? '');
    $dob            = clean($d['date_of_birth']   ?? '');
    $phone          = clean($d['phone']           ?? '');
    $civil          = clean($d['civil_status']    ?? 'Single');
    $address        = clean($d['address']         ?? '');
    $purpose        = clean($d['purpose']         ?? '');
    $payMethod      = clean($d['payment_method']  ?? '');
    $payRef         = clean($d['payment_ref']     ?? '');
    $processingType = clean($d['processing_type'] ?? 'normal');

    if (!in_array($processingType, ['normal', 'urgent'])) $processingType = 'normal';

    if (!$docTypeId) jsonError('Document type is required.');
    if (!$fullName)  jsonError('Full name is required.');
    if (!$dob)       jsonError('Date of birth is required.');
    if (!$phone)     jsonError('Phone number is required.');
    if (!$address)   jsonError('Address is required.');
    if (!$purpose)   jsonError('Purpose is required.');

    $pdo    = getDB();
    $dtStmt = $pdo->prepare("SELECT * FROM document_types WHERE id = ? AND is_active = 1 LIMIT 1");
    $dtStmt->execute([$docTypeId]);
    $dt = $dtStmt->fetch();
    if (!$dt) jsonError('Invalid document type.');

    $baseFee   = (float)$dt['fee'];
    $urgentFee = ($processingType === 'urgent') ? (float)$dt['urgent_fee'] : 0.00;
    $totalFee  = $baseFee + $urgentFee;
    $isFree    = $totalFee == 0;

    if (!$isFree) {
        if (!in_array($payMethod, ['GCash','Maya'])) jsonError('Payment method must be GCash or Maya.');
        if (!$payRef) jsonError('Payment reference number is required.');
    } else {
        $payMethod = 'FREE';
        $payRef    = 'FREE';
    }

    if (!in_array($civil, ['Single','Married','Widowed','Separated'])) $civil = 'Single';

    $refNo = generateRefNo();

    $stmt = $pdo->prepare("
        INSERT INTO requests
            (reference_no, user_id, doc_type_id, full_name, date_of_birth, phone,
             civil_status, address, purpose, fee, processing_type, urgent_fee,
             payment_method, payment_ref, payment_verified, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([
        $refNo, $user['id'], $docTypeId, $fullName, $dob, $phone,
        $civil, $address, $purpose, $totalFee, $processingType, $urgentFee,
        $payMethod, $payRef, $isFree ? 1 : 0
    ]);

    $newId = $pdo->lastInsertId();
    $processingLabel = $processingType === 'urgent' ? 'Urgent Processing' : 'Normal Processing';

    try {
        $pdo->prepare("
            INSERT INTO notifications (user_id, title, message, icon)
            VALUES (?, 'Request Submitted', ?, '📄')
        ")->execute([
            $user['id'],
            "Your {$processingLabel} request for {$dt['name']} ({$refNo}) has been received. We'll notify you once it's processed."
        ]);
    } catch (Exception $e) {
        // notifications table may not exist yet — don't block submission
    }

    jsonOk(['reference_no' => $refNo, 'request_id' => $newId], 'Request submitted successfully.');
}

// ── UPDATE STATUS (admin only) ────────────────────────────
function handleStatus(): void {
    $admin = requireAuth('admin');
    $d     = getJson();

    $id     = (int)($d['id']            ?? 0);
    $status = clean($d['status']        ?? '');
    $reason = clean($d['reject_reason'] ?? '');

    if (!$id) jsonError('Request ID required.');
    if (!in_array($status, ['processing','ready','completed','rejected'])) jsonError('Invalid status.');
    if ($status === 'rejected' && !$reason) jsonError('Rejection reason is required.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT r.*, u.id AS uid, dt.name AS doc_name
        FROM requests r
        JOIN users u ON u.id = r.user_id
        JOIN document_types dt ON dt.id = r.doc_type_id
        WHERE r.id = ? LIMIT 1
    ");
    $stmt->execute([$id]);
    $req = $stmt->fetch();
    if (!$req) jsonError('Request not found.', 404);

    $pdo->prepare("
        UPDATE requests
        SET status = ?, reject_reason = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ")->execute([$status, $status === 'rejected' ? $reason : null, $admin['id'], $id]);

    $messages = [
        'processing' => "Your request for {$req['doc_name']} ({$req['reference_no']}) is now being processed.",
        'ready'      => "Your {$req['doc_name']} ({$req['reference_no']}) is ready! Please visit the barangay hall to claim it.",
        'completed'  => "Your {$req['doc_name']} ({$req['reference_no']}) has been claimed. Thank you!",
        'rejected'   => "Your request for {$req['doc_name']} ({$req['reference_no']}) was rejected. Reason: {$reason}",
    ];
    $icons = ['processing' => '🔄', 'ready' => '✅', 'completed' => '🏁', 'rejected' => '❌'];

    try {
        $pdo->prepare("
            INSERT INTO notifications (user_id, title, message, icon)
            VALUES (?, ?, ?, ?)
        ")->execute([$req['uid'], 'Request Update', $messages[$status], $icons[$status]]);
    } catch (Exception $e) {
        // notifications table may not exist yet
    }

    jsonOk([], 'Status updated to ' . $status . '.');
}

// ── TRACK by reference number ─────────────────────────────
function handleTrack(): void {
    $refNo = clean($_GET['ref'] ?? '');
    if (!$refNo) jsonError('Reference number is required.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT r.reference_no, r.status, r.reject_reason, r.purpose, r.fee, r.payment_method,
               DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date,
               dt.name AS doc_name, dt.icon AS doc_icon
        FROM requests r
        JOIN document_types dt ON dt.id = r.doc_type_id
        WHERE r.reference_no = ? LIMIT 1
    ");
    $stmt->execute([strtoupper($refNo)]);
    $req = $stmt->fetch();

    if (!$req) jsonError('No request found with that reference number.', 404);
    jsonOk(['request' => $req]);
}

// ── DOCUMENT TYPES ────────────────────────────────────────
function handleDocTypes(): void {
    $pdo  = getDB();
    $stmt = $pdo->query("
        SELECT id, name, icon, fee, urgent_fee, processing_days, description
        FROM document_types WHERE is_active = 1 ORDER BY id
    ");
    jsonOk(['doc_types' => $stmt->fetchAll()]);
}