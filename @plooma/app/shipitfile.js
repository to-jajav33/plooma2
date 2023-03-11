/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// https://www.digitalocean.com/community/tutorials/how-to-automate-your-node-js-production-deployments-with-shipit-on-centos-7


// module.exports = shipit => {
//   // Load shipit-deploy tasks
//   require('shipit-deploy')(shipit)

//   shipit.initConfig({
//     default: {
//       deployTo: '/var/www-node/jajav33.com',
//       repositoryUrl: 'https://github.com/to-jajav33/jajav33.git',
//     },
//     production: {
//       servers: 'shipit@162.243.155.109:2600'
//     }
//   })
// }


module.exports = shipit => {
    const shipit_deploy = require('shipit-deploy');
    const shipit_shared = require('shipit-deploy');
    const dotenv = require('dotenv');
    dotenv.config();
    const path = require('path');
    const fs = require('fs');
    const fse = require('fs-extra');

    shipit_deploy(shipit);
    shipit_shared(shipit);
  
    const appName = 'Plooma';
    const ecosystemConfigFilename = 'ecosystem.config.js';
    const subdomain = 'plooma.jajav33.com';
    const compileTo = 'spa'; // 'spa' || 'ssr'; // more will be added like electron/pwa/mobile etc
  
    let toCopy = '';
    switch(compileTo) {
      case 'ssr':
        toCopy = 'ssr';
        break;
      case 'spa':
      default:
        toCopy = 'spa';
        break;
    }

    const dirToCopy = path.join(__dirname, `./dist/${toCopy}`);

    shipit.initConfig({
      default: {
        key: process.env.SHIPIT_KEY_PATH,
        workspace: path.join(__dirname),
        deployTo: `/var/www-node/${subdomain.startsWith('www.') ? subdomain.replace('www.', '') : subdomain}`,
        dirToCopy,
        repositoryUrl: 'https://github.com/to-jajav33/jajav33.git',
        keepReleases: 5,
        shared: {
          overwrite: true,
          dirs: ['node_modules']
        },
        shallowClone: true
      },
      production: {
        servers: process.env.SHIPIT_SSH_PATH
      },
      // gitConfig: process.env.SHIPIT_KEY_PATH ? {'core.sshCommand':`ssh -i ${process.env.SHIPIT_KEY_PATH}`} : undefined // https://github.com/shipitjs/shipit-deploy/issues/126#issuecomment-338742749
    });
  
    const ecosystemFilePath = path.join(
      shipit.config.deployTo,
      'shared',
      ecosystemConfigFilename
    );
  
    shipit.on('fetched', () => {
      shipit.start('build');
    });
    // Our listeners and tasks will go here
    shipit.on('updated', async () => {
      switch(compileTo) {
        case 'ssr':
          await shipit.start('copy-env', 'npm-install', 'copy-config');
          break;
        case 'spa':
        default:
          await shipit.start('copy-config');
          break;
      }
    });
    shipit.on('published', async () => {
      const tasks = [];
      switch(compileTo) {
        case 'ssr':
          tasks.push('pm2-server');
          break;
        case 'spa':
        default:
          tasks.push('add-server');
          tasks.push('npm-install');
          tasks.push('pm2-server');
          break;
      }
      await shipit.start(...tasks);
    });
    shipit.on('rollback', async () => {
      switch(compileTo) {
        case 'ssr':
          await shipit.start('copy-env', 'npm-install', 'copy-config');
          break;
        case 'spa':
        default:
          await shipit.start('copy-config');
          break;
      }
    });
    shipit.on('deploy', async () => {
      // await shipit.start('addSshKey');
      // await shipit.start(['fix-win']);
    });

    // https://github.com/shipitjs/shipit/issues/278
    shipit.blTask('fix-win', () => {
      shipit.pool.connections.forEach((connection) => {
          const { runLocally } = connection;
          connection.runLocally = function(cmd, options) {
              if(!cmd.startsWith('ssh')) {
                  cmd = cmd.replace(/ rm /g, ' del /s /q ');
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return runLocally.call(this, cmd, options);
          }
      });
    });

    shipit.blTask('add-server', async () => {
      await shipit.copyToRemote(path.join(__dirname, 'package.json'), path.join(shipit.releasePath, 'package.json'));
      await shipit.remote(`cd ${shipit.releasePath}`);

      // .......... file begins ........
      const indexJSStr = `
      const { execSync } = require('child_process');

      execSync('cd ${shipit.releasePath} && npx quasar serve --port ${process.env.PORT_PLOOMA_NODE} --hostname ${process.env.REVERSE_PROXY_IP} --https -K ${process.env.PRIVKEYPATH_JAJAV33} -C ${process.env.CERTPATH_JAJAV33}');
      `;
      // .......... file ends ........

      const localIndexJSPath = path.join('dist/spa/', 'index.js');
      
      console.log('write index: ', indexJSStr);
      
      console.log('to: ', localIndexJSPath);
      fs.writeFileSync(localIndexJSPath, indexJSStr, function (err) {
        if (err) throw err;

        console.log('File created successfully.');
      });

      const remoteIndexJSPath = path.join(shipit.releasePath, 'index.js')
      await shipit.copyToRemote(localIndexJSPath, remoteIndexJSPath);
    });

    shipit.blTask('build', async () => {
      switch (compileTo) {
        case 'ssr':
          await shipit.local('npx quasar build -m ssr');
          break;
        case 'spa':
        default:
          await shipit.local('npx quasar build -m spa');
          const renamed = path.join(dirToCopy, '../www/');
          fs.renameSync(dirToCopy, renamed);
          console.log('Renamed: ', dirToCopy, ' to ', renamed);
          await fse.move(renamed, dirToCopy);
          console.log('moving: ', renamed, ' to ', dirToCopy);
          break;
      }
    });
    
    shipit.blTask('copy-config', async () => {
      let ecosystem;
      fs.mkdirSync('dist/shared/', { recursive: true }, (err) => {
        if (err) throw err;
      });
      switch(compileTo) {
        case 'spa':
        case 'ssr':
        default:
          ecosystem = {
            apps: [
              {
                name: `${appName}`,
                script: path.join(`${shipit.releasePath}`, 'index.js'),
                watch: false,
                restart_delay: 1000,
                env: {
                  NODE_ENV: 'development'
                },
                env_production: {
                  NODE_ENV: 'production'
                }
              }
            ]
          };
          break;
      }
  
      const ecosystemStr = `module.exports = ${JSON.stringify(ecosystem)};`;
      const localEcoSysPath = path.join('dist/shared/', ecosystemConfigFilename);

      fs.writeFileSync(localEcoSysPath, ecosystemStr, function (err) {
        if (err) throw err;

        console.log('File created successfully.');
      });

      await shipit.copyToRemote(localEcoSysPath, ecosystemFilePath);
    });

    shipit.blTask('copy-env', async () => {
      await shipit.copyToRemote(path.join('./.env'), path.join(`${shipit.releasePath}`, '.env'))
    });

    shipit.blTask('npm-install', async () => {
      await shipit.remote(`cd ${shipit.releasePath} && npm install --production && npm install -D dotenv && npm install -D @quasar/cli`);
    });

    shipit.blTask('pm2-server', async () => {
      await shipit.remote(`pm2 delete -s ${appName} || :`);
      await shipit.remote(`pm2 start ${ecosystemFilePath} --env production`);
      // await shipit.start('addToSitesAvailable');
    });

    shipit.blTask('addToSitesAvailable', async () => {
      const sitesAvailablePath = `${process.env.SITES_AVAILABLE_PATH}${subdomain}`;
      let doesSitesAvailableFileExists = false;
      try {
        let result = await shipit.remote(`[ -d "${sitesAvailablePath}" ] && echo "true" || echo "false"`);
        if (Array.isArray(result)) {
          console.log('Result:', result.stdout);
          result = result[0];
        } else {
          console.log('Result:', result.stdout);
        }

        const val = result.stdout.replace('\n', '');

        doesSitesAvailableFileExists = (val === 'true');
        if (doesSitesAvailableFileExists) {
          console.error('Did not add to sites-available. File already exists.');
          return;
        }
        
        if (val !== 'false') {
          console.error('Did not add to sites-available. False was not returned. ', val);
          return;
        }
      } catch (e) {
        console.log(e);
        if (e !== 'false') {
          console.log('Did not add to sites-available. error occured');
          console.error('ERROR:', e);
          console.log('end result');
          return;
        }
      }

      console.log('Adding to sites-available');

      await shipit.remote(`echo "
      server {
        listen 443 ssl;
        listen [::]:443 ssl ipv6only=on;

        server_name ${subdomain};

        location / {
          proxy_pass https://${process.env.REVERSE_PROXY_IP}:${process.env.PORT_PLOOMA_NODE};
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
        }
      }
      
      server {
        listen 80;
        listen [::]:80 ipv6only=on;

        server_name ${subdomain};
        return 301 https://$server_name$request_uri;
      }">> ${sitesAvailablePath}`, {tty: true});

      console.log('Updating sites-available permissions');
      // check config
      await shipit.remote('sudo nginx -t', {tty: true});
      // await shipit.remote(`chown $USER:$USER /etc/nginx/sites-available/${subdomain}`, {tty: true});
      await shipit.remote(`ln -s /etc/nginx/sites-available/${subdomain} /etc/nginx/sites-enabled/${subdomain}`, {tty: true});
      console.log('Restarting sites-available');
      
      try {
        console.log('ATTEMPT: sites-available certificates');
        await shipit.remote('sudo service nginx stop', {tty: true});
        await shipit.remote('certbot certonly --nginx --cert-name jajav33.com', {tty: true});
        await shipit.remote('service nginx start', {tty: true});
        console.log('SUCCESS: sites-available certificates');
      } catch (e) {
        console.error('FAILED: sites-available certificates');
        console.error(e);
        // try {
        //   await shipit.remote(`certbot --nginx -d ${subdomain}`);
        // } catch(e2) {
        //   console.error(e2);
        // }

        // if still could not bind() error appears
        // sudo lsof -i -P -n | grep LISTEN
        // if nginx is using those ports https://stackoverflow.com/questions/42303401/nginx-will-not-start-address-already-in-use

        // if duplicate listen options for [::]:80
        // https://github.com/certbot/certbot/issues/5550
      }
    });

    // https://github.com/shipitjs/shipit-deploy/issues/126#issuecomment-338742749
    shipit.blTask('addSshKey', async function addSshKey() {
      if (!shipit.config.key) return
      shipit.log('Add SSH key "%s" to SSH-Agent', shipit.config.key);
      await shipit.local('eval `ssh-agent -s`', { cwd: shipit.config.workspace })
      await shipit.local(`ssh-add ${shipit.config.key}`, { cwd: shipit.config.workspace })
      shipit.log('SSH key added')
    });
  };