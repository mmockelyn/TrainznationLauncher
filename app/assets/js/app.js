
const $                 = require('jquery')
const { ipcRenderer }   = require('electron');
const Store             = require('electron-store')
const swal              = require('sweetalert2')
const fs                = require('fs')
const Shell             = require('node-powershell')




let store = new Store()

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const version = document.getElementById('FrameTitleVersion')

$('[data-toggle="tooltip"]').tooltip()

$.get(__dirname+'/pdl')
    .done((data) => {
        store.set('versionLocal', data)
        $("#pdlVersionText").html('Version: '+store.get('versionLocal'))   
    })
    .catch(() => {
        swal.error("Erreur lors de la récupération de la version locale")
    })

$.get('https://trainznation-eu.s3.eu-west-3.amazonaws.com/Ligne/pdl')
    .done((data) => {
        store.set('versionDistant', data)
    })
    .catch(() => {
        swal.error("Erreur lors de la récupération de la version distante")
    })
    
if(store.get('versionLocal') != store.get('versionDistant')) {
    $("#pdlVersionState").removeClass('text-muted').addClass('text-danger').html("Votre version n'est pas à jour ("+ store.get('versionLocal') +" => "+ store.get('versionDistant') +")")
}

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = "Une nouvelle version du launcher est disponible. Téléchargement en cours..";
    notification.classList.remove('hidden');
  });

  ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Mise à jour télécharger. Vous devez redémarrer le programme. Voulez-vous le redemarrer ?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
  });  

  ipcRenderer.send('app_version')
  ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText =  arg.version;
  });

  function closeNotification() {
    notification.classList.add('hidden');
  }
  function restartApp() {
    ipcRenderer.send('restart_app');
  }

$("#btnLaunch").on('click', (event) => {
    $.post('https://trainznation.eu/api/route/update', {'build': store.get('versionDistant')})
        .done((data) => {
            swal.fire({
                title: "Note de mise à jour: "+store.get('versionDistant'),
                html: `
                <div class="text-left">
                <h5>Nouveauté</h5>
                    <ul>
                        <li>Pose des décors (St Gildas des Bois - Sévérac)</li>
                    </ul>
                </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Installer cette mise à jour'
            }).then((result) => {
                if(result.value) {
                    if(store.get('versionLocal') !== store.get('versionDistant')) {
                        const child = require('child_process').execFile
                        let executable = __dirname+'/aps/wyUpdate.exe'
        
                        child(executable, (err, data) => {
                            if(err) {
                                swal.error(err)
                            } else {
                                
                            }
                        })
                    } else {
                        swal.error("Vous possédez déjà la plus haute version.")
                    }
                }
            })
        })
})    

$("#btnTest").on('click', (event) => {
    const ps = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand('Get-Location')
    ps.invoke()
        .then(output => {
            console.log(output)
        })
        .catch(err => {
            console.error(err)
        })
})

$('#frameButton_minimize').on('click', (event) => {
    const remote = require('electron').remote
    let window = remote.getCurrentWindow()
    window.minimize()
})

$('#frameButton_restoredown').on('click', (event) => {
    const remote = require('electron').remote
    let window = remote.getCurrentWindow()
    if(window.isMaximized) {
        window.restore()
    }else{
        window.maximize()
    }
})

$('#frameButton_close').on('click', (event) => {
    const remote = require('electron').remote
    let window = remote.getCurrentWindow()
    window.close()
})