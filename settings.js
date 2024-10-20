function closesettings() {
    $("#mysettings").hide();
    let reload = settings['city'] !== $('#city').val();
    settings['city'] = $('#city').val();
    settings['min-xp'] = $('#min-xp').val();
    settings['max-xp'] = $('#max-xp').val();
    settings['mode'] = $('#mode').val();
    settings['team'] = $('#team').val();
    settings['free-slots'] = $('#free-slots').val();
    settings['takeover'] = 0;
    if ($("#takeover").prop( "checked" ) ) {
        settings['takeover'] = 1;
    }
    settings['min-time'] = $('#min-time').val();
    settings['max-time'] = $('#max-time').val();
    localStorage.setItem('settings', JSON.stringify(settings));
    
    if (reload) {
        location.reload();
        return;
    }

    for (const [gymID, gym] of Object.entries(markers)) {
        gym.fire('refreshGym');
    };
};

$('<div>').attr('id', 'settingsbutton').appendTo('#map').on('click', () => { $("#mysettings").show() });
$('<div>').attr('id', 'mysettings').addClass('container-fluid').appendTo('body');

//city selection
let r = $('<div>').addClass('row').appendTo('#mysettings');
$('<div>').addClass('col-12').appendTo(r).text('City selection').css('font-weight', 'bold');
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('City');
let c = $('<div>').addClass('col-8').appendTo(r);
$('<select>').attr('name', 'city').attr('id', 'city').css('max-width', 'inherit').appendTo(c);
$.get('defs/locations.csv', function(res) {
    const locations = res.split('\n');
    for(i in locations) {
        if (locations[i] != '' ) {
            $('<option>').attr('value', locations[i]).text(locations[i]).appendTo('#city');
        }
    }
    $('#city').val(settings['city']);
});


r = $('<div>').addClass('row').appendTo('#mysettings');
$('<div>').addClass('col-12').appendTo(r).text('Display only gyms with..').css('font-weight', 'bold');

//min xp to show
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Min XP');
c = $('<div>').addClass('col-8').appendTo(r);
$('<input>').attr('type', 'number').attr('id', 'min-xp').appendTo(c).val(settings['min-xp']);

//max xp to show
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Max XP');
c = $('<div>').addClass('col-8').appendTo(r);
$('<input>').attr('type', 'number').attr('id', 'max-xp').appendTo(c).val(settings['max-xp']);

//min free slots
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Free slots');
c = $('<div>').addClass('col-8').appendTo(r);
$('<input>').attr('type', 'number').attr('id', 'free-slots').appendTo(c).val(settings['free-slots']);

// also other colored teams
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
c = $('<div>').addClass('col-12').appendTo(r);
$('<input />', { type: 'checkbox', id: 'takeover', value: 'takeover'}).appendTo(c).prop( "checked", settings['takeover'] == 1 );
$('<span>&nbsp</span>').appendTo(c);
$('<label />', { 'for': 'takeover', text: 'Also show gyms I can take over' }).appendTo(c);

//min time
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Min time');
c = $('<div>').addClass('col-8').appendTo(r);
$('<input>').attr('type', 'number').attr('id', 'min-time').appendTo(c).val(settings['min-time']);

//max time
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Max time');
c = $('<div>').addClass('col-8').appendTo(r);
$('<input>').attr('type', 'number').attr('id', 'max-time').appendTo(c).val(settings['max-time']);



r = $('<div>').addClass('row').appendTo('#mysettings');
$('<div>').addClass('col-12').appendTo(r).text('Setup').css('font-weight', 'bold');

// mode
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Mode');
c = $('<div>').addClass('col-8').appendTo(r);
$('<select>').attr('name', 'mode').attr('id', 'mode').appendTo(c);
$('<option>').attr('value', 'badgemode').text('Badge mode').appendTo('#mode');
$('<option>').attr('value', 'xpmode').text('XP mode').appendTo('#mode');
$('#mode').val(settings['mode']);

// team
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Team');
c = $('<div>').addClass('col-8').appendTo(r);
$('<select>').attr('name', 'team').attr('id', 'team').appendTo(c);
$('<option>').attr('value', 'mystic').text('Mystic').appendTo('#team');
$('<option>').attr('value', 'valor').text('Valor').appendTo('#team');
$('<option>').attr('value', 'instinct').text('Instinct').appendTo('#team');
$('#team').val(settings['team']);




r = $('<div>').addClass('row').appendTo('#mysettings');
$('<div>').addClass('col-12').appendTo(r).text('Import/Export').css('font-weight', 'bold');

// create backup
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Create backup');
c = $('<div>').addClass('col-8').appendTo(r);
$('<button>').text('Download').appendTo(c).on('click', makebackup);


// restore backup
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Restore backup');
c = $('<div>').addClass('col-6').appendTo(r);
$('<input>').attr('type', 'file').attr('id', 'restorebackupfile').text('Select file').appendTo(c);
c = $('<div>').addClass('col-2').appendTo(r);
$('<button>').text('Upload').appendTo(c).on('click', restorebackup);

// import data
r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
$('<div>').addClass('col-4').appendTo(r).text('Import gymscan');
c = $('<div>').addClass('col-6').appendTo(r);
$('<input>').attr('type', 'file').attr('id', 'importdatafile').text('Select file').appendTo(c);
c = $('<div>').addClass('col-2').appendTo(r);
$('<button>').text('Import').appendTo(c).on('click', importdata);

r = $('<div>').addClass('row mb-3').appendTo('#mysettings');
c = $('<div>').addClass('col-12').appendTo(r);
$('<button>').text('Close').appendTo(c).on('click', closesettings).css('width', '100%');



function makebackup() {
    $('<a>').attr('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(JSON.stringify(save))).appendTo('body').attr('id', 'mysave').attr('download', 'backup.txt');
    $('#mysave')[0].click();
    $('#mysave').remove();
}

function restorebackup() {
    const selectedFile = document.getElementById("restorebackupfile").files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        save = JSON.parse(e.target.result);
        localStorage.setItem('save', JSON.stringify(save));
        location.reload();
        $('#restorebackup').remove();
    };
    reader.readAsText(selectedFile);
}

function importdata() {
    $.get('defs/' + settings['city'] + '.json', function(res) {
        let names = {};
        let duplicates = [];
        $(res).each(function(i, row) {
            if (typeof names[row.name] != 'undefined' ) {
                duplicates.push(row.name);
            } else {
                names[row.name] = row;
            }
        });
        $(duplicates).each(function(i, row) {
            delete names[row];
        });

        const selectedFile = document.getElementById("importdatafile").files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            let rows = e.target.result.split(/\n/);
            let foundDuplicates = [];
            let missingGyms = [];
            let lowerXP = [];
            $(rows).each(function(i, row) {
                let data = row.split(/\t/);

                // gym is a duplicate so we dont know what gym to apply the xp to
                if (duplicates.includes(data[0])) {
                    foundDuplicates.push(data[0] + ' (' + parseInt(data[1]) + ')');
                    return;
                }
                
                // gym does not exist
                if (typeof names[data[0]] == 'undefined' ) {
                    missingGyms.push(data[0] + ' (' + parseInt(data[1]) + ')');
                    return;
                }
                    
                const id = names[data[0]].id;
                
                // new info has lower xp that old
                if (typeof save.gyms[id] !== 'undefined') {
                    if (save.gyms[id].xp > parseInt(data[1])) {
                        lowerXP.push(data[0] + ' ' + save.gyms[id].xp + ' => ' + parseInt(data[1]));
                        return;
                    }
                }

                setBadgeXP(parseInt(data[1]), id);
                markers[id].fire('refreshGym');
            });


            let message = '';

            if(foundDuplicates.length > 0) {
                message = message + 'These gyms could not be decided by name:\n' + foundDuplicates.join('\n') + '\n\n\n';
            }

            if(missingGyms.length > 0) {
                message = message + 'These gyms could not be found at all:\n' + missingGyms.join('\n') + '\n\n\n';
            }

            if(lowerXP.length > 0) {
                message = message + 'These gyms had lower xp set in the import file:\n' + lowerXP.join('\n') + '\n\n\n';
            }

            if (message != '') {
                alert(message);
                console.log(message);
            }
            
            closesettings(false);
        };
        reader.readAsText(selectedFile);
    });
}
