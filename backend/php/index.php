<?php
// Simple router — redirects API calls to the right file
header("Content-Type: application/json");
http_response_code(200);
echo json_encode(["status" => "Barangay Connect API is running"]);