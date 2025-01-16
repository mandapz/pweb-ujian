<?php
// api/sales.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'salesforce';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}

// GET request - Fetch all sales
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM sales ORDER BY sale_date DESC");
        $stmt->execute();
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($sales);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// POST request - Create new sale
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO sales (customer_name, product, quantity, sale_date, price, amount, status)
            VALUES (:customer_name, :product, :quantity, :sale_date, :price, :amount, :status)
        ");
        
        $stmt->execute([
            ':customer_name' => $data['customer_name'],
            ':product' => $data['product'],
            ':quantity' => $data['quantity'],
            ':sale_date' => $data['sale_date'],
            'price' => $data['price'],
            ':amount' => $data['amount'],
            ':status' => $data['status']
        ]);
        
        echo json_encode(['message' => 'Sale created successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT request - Update sale
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("
            UPDATE sales 
            SET customer_name = :customer_name,
                product = :product,
                quantity = :quantity,
                sale_date = :sale_date,
                price = :price,
                amount = :amount,
                status = :status
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':customer_name' => $data['customer_name'],
            ':product' => $data['product'],
            ':quantity' => $data['quantity'],
            ':sale_date' => $data['sale_date'],
            'price' => $data['price'],
            ':amount' => $data['amount'],
            ':status' => $data['status'],
            ':id' => $id
        ]);
        
        echo json_encode(['message' => 'Sale updated successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// DELETE request - Delete sale
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("DELETE FROM sales WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        echo json_encode(['message' => 'Sale deleted successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>