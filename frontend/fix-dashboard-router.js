const fs = require('fs');
const path = require('path');

// Fix DashboardView completely
const dashboardPath = path.join(__dirname, 'src', 'components', 'admin', 'DashboardView.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Remove router variable if it exists
dashboardContent = dashboardContent.replace(/\n  const router = useRouter\(\);/g, '');

// Remove useRouter import if it exists
dashboardContent = dashboardContent.replace(/\nimport { useRouter } from 'next\/navigation';/g, '');

fs.writeFileSync(dashboardPath, dashboardContent);
console.log('✅ Fixed DashboardView.tsx completely');

console.log('\n🎉 All router references removed!');
