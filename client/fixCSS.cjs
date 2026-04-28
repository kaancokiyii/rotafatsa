const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');
// remove anything after the last known good string, or strip null bytes
css = css.replace(/\0/g, '');
// But PowerShell appends UTF-16, so it's a mix.
// The easiest way is to re-read it, clean it, and make sure the new CSS is there.
const cleanCss = css.replace(/[\u0000]/g, '').replace(/ \/ \*   P a g e   T r a n s i t .*/s, '');
fs.writeFileSync('src/index.css', cleanCss + `
/* Page Transitions */
.route-transition-wrapper {
    animation: pageFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    width: 100%;
}

@keyframes pageFadeIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`);
console.log('Fixed index.css');
