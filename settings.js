function closesettings(reload) {
	$("#mysettings").hide();
	settings['city'] = $('#city').val();
	settings['gymsettings'] = $('#gymsettings').val();
	settings['mode'] = $('#mode').val();
	localStorage.setItem('settings', JSON.stringify(settings));
    
	if (reload) {
		location.reload();
	}
};

$('<div>').attr('id', 'settingsbutton').appendTo('#map')
	.on('click', function() { $("#mysettings").css({display: 'grid'}) });


$('<div>').attr('id', 'mysettings').appendTo('body');
$('<select>').attr('name', 'city').attr('id', 'city').appendTo('#mysettings');

$.get('defs/locations.csv', function(res) {
    const locations = res.split('\n');
	for(i in locations) {
        if (locations[i] != '' ) {
            $('<option>').attr('value', locations[i]).text(locations[i]).appendTo('#city');
        }
    }
    $('#city').val(settings['city']);
});

$('<p>').appendTo('#mysettings');

$('<select>').attr('name', 'gymsettings').attr('id', 'gymsettings').appendTo('#mysettings');
$('<option>').attr('value', 'showall').text('Show all').appendTo('#gymsettings');
$('<option>').attr('value', 'onlygold').text('Only gold').appendTo('#gymsettings');
$('<option>').attr('value', 'onlyneargold').text('Only near gold').appendTo('#gymsettings');
$('<option>').attr('value', 'hidegold').text('Hide gold').appendTo('#gymsettings');
$('<option>').attr('value', 'onlynew').text('Only new').appendTo('#gymsettings');
$('<option>').attr('value', 'farfromgold').text('Far from gold').appendTo('#gymsettings');
$('#gymsettings').val(settings['gymsettings']);
$('<p>').appendTo('#mysettings');

$('<select>').attr('name', 'mode').attr('id', 'mode').appendTo('#mysettings');
$('<option>').attr('value', 'badgemode').text('Badge mode').appendTo('#mode');
$('<option>').attr('value', 'xpmode').text('XP mode').appendTo('#mode');
$('#mode').val(settings['mode']);
$('<p>').appendTo('#mysettings');

$('<button>').text('Make backup').appendTo('#mysettings').on('click', makebackup);
$('<p>').appendTo('#mysettings');

$('<input>').attr('type', 'file').attr('id', 'restorebackupfile').text('Select file').appendTo('#mysettings');
$('<br>').appendTo('#mysettings');
$('<button>').text('Restore backup').appendTo('#mysettings').on('click', restorebackup);

$('<p>').appendTo('#mysettings');

$('<input>').attr('type', 'file').attr('id', 'importdatafile').text('Select file').appendTo('#mysettings');
$('<br>').appendTo('#mysettings');
$('<button>').text('Import data').appendTo('#mysettings').on('click', importdata);

$('<p>').appendTo('#mysettings');
$('<button>').text('Close').appendTo('#mysettings').on('click', () => closesettings(true));



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
