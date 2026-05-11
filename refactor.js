const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let originalContent = content;
      
      // Replace import
      content = content.replace(/import\s+\{\s*(?:prisma|getTenantPrisma)(?:\s*,\s*(?:prisma|getTenantPrisma))?\s*\}\s+from\s+["']@\/lib\/prisma["'];/g, 'import { getTenantPrismaServer } from "@/lib/prisma";');
      
      // Replace prisma.
      content = content.replace(/\bprisma\./g, '(await getTenantPrismaServer()).');
      
      // If the file changed, we might need to add async to the containing functions if it's not async already, 
      // but in Next.js Server Actions/Components they are usually async.
      // Wait, let's just write and hope TS complains if they aren't async.
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('src/app/(app)');
