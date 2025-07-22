#!/bin/bash

# SecureDrop CLI Demo Commands
# Copy and paste these commands during the demo

echo "🛡️ SecureDrop CLI Demo Commands"
echo "================================"

# 1. Show CLI help
echo "📋 Step 1: Show CLI capabilities"
echo "Command: node src/cli/securedrop-cli.ts --help"
echo ""

# 2. Generate malicious test files
echo "⚠️ Step 2: Generate malicious test files"
echo "Command: node src/cli/securedrop-cli.ts generate-mock --type malicious --count 5 --output ./demo-test-files"
echo ""

# 3. Generate clean test files  
echo "✅ Step 3: Generate clean test files"
echo "Command: node src/cli/securedrop-cli.ts generate-mock --type image --count 3 --output ./demo-test-files"
echo ""

# 4. Scan the generated files
echo "🔍 Step 4: Security scan of generated files"
echo "Command: node src/cli/securedrop-cli.ts scan ./demo-test-files --level strict --output scan-report.json"
echo ""

# 5. Test configuration with sample files
echo "🧪 Step 5: Test configuration"
echo "Command: node src/cli/securedrop-cli.ts test-config --files './demo-files/*'"
echo ""

# 6. Generate security configuration
echo "⚙️ Step 6: Generate strict security config"
echo "Command: node src/cli/securedrop-cli.ts init-config --type strict --output strict-security.json"
echo ""

# 7. Run performance benchmark
echo "🚀 Step 7: Performance benchmark"
echo "Command: node src/cli/securedrop-cli.ts benchmark --files 20 --size 2 --threads 4"
echo ""

# 8. Scan our demo files
echo "🎯 Step 8: Scan our demo files"
echo "Command: node src/cli/securedrop-cli.ts scan ./demo-files --level moderate --recursive"
echo ""

echo "Demo commands ready! Copy and paste as needed during presentation."

# ACTUAL EXECUTABLE COMMANDS (uncomment to run)

# Show help
# node src/cli/securedrop-cli.ts --help

# Generate malicious test files
# node src/cli/securedrop-cli.ts generate-mock --type malicious --count 5 --output ./demo-test-files

# Generate clean image files
# node src/cli/securedrop-cli.ts generate-mock --type image --count 3 --output ./demo-test-files

# Scan generated files
# node src/cli/securedrop-cli.ts scan ./demo-test-files --level strict --output scan-report.json

# Test configuration
# node src/cli/securedrop-cli.ts test-config --files './demo-files/*'

# Generate strict config
# node src/cli/securedrop-cli.ts init-config --type strict --output strict-security.json

# Performance benchmark
# node src/cli/securedrop-cli.ts benchmark --files 20 --size 2 --threads 4

# Scan demo files
# node src/cli/securedrop-cli.ts scan ./demo-files --level moderate --recursive 