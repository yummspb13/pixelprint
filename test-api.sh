#!/bin/bash

echo "=== API Testing Script ==="
echo "Testing all endpoints after Prisma fix..."

# Test Health API
echo "1. Testing /api/health..."
curl -s http://localhost:3010/api/health
echo -e "\n"

# Test Pricing API
echo "2. Testing /api/pricing/services..."
curl -s http://localhost:3010/api/pricing/services
echo -e "\n"

# Test Quote API
echo "3. Testing /api/quote..."
curl -X POST http://localhost:3010/api/quote \
  -H "Content-Type: application/json" \
  -d '{"service": "digital-business-cards", "selection": {"Sides": "Single Sided (S/S)", "Quantity": 100}}'
echo -e "\n"

# Test Orders API
echo "4. Testing /api/orders GET..."
curl -s http://localhost:3010/api/orders
echo -e "\n"

# Test Admin Auth API
echo "5. Testing /api/admin/auth GET..."
curl -s http://localhost:3010/api/admin/auth
echo -e "\n"

# Test Admin Orders API
echo "6. Testing /api/admin/orders GET..."
curl -s http://localhost:3010/api/admin/orders
echo -e "\n"

# Test Admin Invoices API
echo "7. Testing /api/admin/invoices GET..."
curl -s http://localhost:3010/api/admin/invoices
echo -e "\n"

# Test Admin Invoice Settings API
echo "8. Testing /api/admin/invoice-settings GET..."
curl -s http://localhost:3010/api/admin/invoice-settings
echo -e "\n"

# Test Admin Prices API
echo "9. Testing /api/admin/prices/services GET..."
curl -s http://localhost:3010/api/admin/prices/services
echo -e "\n"

echo "=== Testing Complete ==="
