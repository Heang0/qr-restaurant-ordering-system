const fs = require('fs');
const path = require('path');

// Fix DashboardView
const dashboardPath = path.join(__dirname, 'src', 'components', 'admin', 'DashboardView.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Remove onClick handlers from Quick Actions buttons
dashboardContent = dashboardContent.replace(/ onClick={() => handleTabChange\('menu'\)}/g, '}');
dashboardContent = dashboardContent.replace(/ onClick={() => handleTabChange\('orders'\)}/g, '}');
dashboardContent = dashboardContent.replace(/ onClick={() => handleTabChange\('settings'\)}/g, '}');

// Remove handleTabChange function if it exists
dashboardContent = dashboardContent.replace(/\n  const handleTabChange = \(tab: string\) => \{[\s\S]*?\};/g, '');

// Remove router import if it exists
dashboardContent = dashboardContent.replace(/\nimport { useRouter } from 'next\/navigation';/g, '');

fs.writeFileSync(dashboardPath, dashboardContent);
console.log('✅ Fixed DashboardView.tsx');

console.log('\n🎉 All Quick Actions fixed!');
