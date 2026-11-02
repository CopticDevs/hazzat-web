const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
const root=process.cwd(),svg=fs.readFileSync(path.join(root,'src/images/logo.svg'),'utf8');
const old=fs.readFileSync(path.join(root,'src/images/logo.png'));const w=old.readUInt32BE(16),h=old.readUInt32BE(20);
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{const page=await browser.newPage({deviceScaleFactor:1});
async function render(file,width,height,ink,background,logoWidth){
 await page.setViewportSize({width,height});
 await page.setContent(`<html><style>html,body{margin:0;width:100%;height:100%;background:${background};}body{display:flex;align-items:center;justify-content:center;color:${ink}}svg{display:block;width:${logoWidth}px;height:auto}</style><body>${svg}</body></html>`);
 fs.mkdirSync(path.dirname(file),{recursive:true});await page.screenshot({path:file,omitBackground:background==='transparent'});
}
await render(path.join(root,'src/images/logo.png'),w,h,'#303030','transparent',w);
for(const [theme,ink,bg]of [['light','#303030','#ffffff'],['dark','#BCC2BA','#20251f']]){
 await render(path.join(root,`docs/branding/logo-${theme}.png`),1005,724,ink,'transparent',1005);
 for(const [kind,width,height,lw]of [['square',1080,1080,864],['banner',1200,630,780]])await render(path.join(root,`docs/branding/social/${kind}-${theme}.png`),width,height,ink,bg,lw);
}
console.log('Exported transparent logo plus light/dark square and banner social artwork.');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
