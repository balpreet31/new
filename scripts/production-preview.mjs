import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['server/index.js'],{stdio:'inherit',windowsHide:true,env:{...process.env,NODE_ENV:'production',PORT:'4173',MONGODB_URI:process.env.MONGODB_URI||'mongodb://127.0.0.1:27018/probay',ALLOWED_ORIGINS:'http://127.0.0.1:4173'}});
process.on('SIGINT',()=>child.kill());process.on('SIGTERM',()=>child.kill());
child.on('exit',code=>process.exit(code||0));
