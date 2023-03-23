var map = L.map('map').setView([59.3, 18], 15); 
var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9oYW5tbGciLCJhIjoiY2xma2hmenR5MGIzMjNxbHFsc2didmtpNSJ9.-E57rIXCzVKCrJsSHbecLw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);


function getBadgeFromXP(xp) {
	if (xp === null) {
		return 'unknown';
	}

	var badgexp = {};
	badgexp[0] = 'new';
	badgexp[500] = 'bronze';
	badgexp[4000] = 'silver';
	badgexp[29000] = 'almostgold';
	badgexp[30000] = 'gold';

	let badge = 'unknown';
	for(var i in badgexp) {
		if ( i <= xp) {
			badge = badgexp[i];
		}
	}
	return badge;
}

function setBadgeXP(input, gymid) {
	let xp = 0;
	if ( typeof input === 'number' ) {
		xp = input;
	} else {
		xp = parseInt($(input).val());
	}
	let badge = getBadgeFromXP(xp);

	let newIcon = L.icon({
	    iconUrl: badge + '.png',
	    iconSize: [38, 38],
        iconAnchor: [20, 20],
        popupAnchor: [-3, -25]
	});
	markers[gymid].setIcon(newIcon);
	save.gyms[gymid] = { badge: badge, xp: xp };

    // handle statistics
    var totalXP = 0;
    var numberOfImportedGyms = 0;
    var numberOfGoldBadges = 0;
    var totalNumberOfGyms = Object.keys(markers).length;

    
    $.each(save.gyms, function(i, row) {
        // gym is in another city
        if ( typeof markers[i] == 'undefined') {
            return;
        }

        numberOfImportedGyms++;
        totalXP+=(typeof row.xp == 'number' ? row.xp : 0);
        
        if (row.xp > 30000) {
            row.xp = 30000;
            save.gyms[i] = 30000;
        }
        
        if (row.xp == 30000) {
            numberOfGoldBadges++;
        }
    });
    
    var percentageOfImported = totalXP / numberOfImportedGyms / 30000 * 100;
    var percentageOfTotal = totalXP / totalNumberOfGyms / 30000 * 100;

    const date = (new Date((new Date()).getTime() - ((new Date()).getTimezoneOffset()*60*1000))).toISOString().split('T')[0];
    
    if (typeof save.stats[settings['city']] == 'undefined') {
        save.stats[settings['city']] = {};
    }
    save.stats[settings['city']][date] = {
        'totalXP': totalXP,
        'numberOfImportedGyms': numberOfImportedGyms,
        'numberOfGoldBadges': numberOfGoldBadges,
        'totalNumberOfGyms': totalNumberOfGyms,
        'percentageOfImported': percentageOfImported,
        'percentageOfTotal': percentageOfTotal
    };
    
	localStorage.setItem('save', JSON.stringify(save));
}



var markers = {}
var save = localStorage.getItem('save');
if (save === null ) {
	save = {};
    save.gyms = {};
    save.stats = {};
	localStorage.setItem('save', JSON.stringify(save));
} else {
	save = JSON.parse(save);
}

var settings = localStorage.getItem('settings');
if (settings === null ) {
	settings = {};
	settings['city'] = 'Stockholm';
	settings['gymsettings'] = 'showall';
	settings['mode'] = 'badgemode';
	localStorage.setItem('settings', JSON.stringify(settings));
} else {
	settings = JSON.parse(settings);
}

$.get('defs/' + settings['city'] + '.json', function(res) {
	$(res).each(function(i, row) {
		let url = 'unknown.png';
		if ( typeof save.gyms[row.id] !== 'undefined' && typeof save.gyms[row.id]['badge'] !== 'undefined' ) {
			url = save.gyms[row.id]['badge'] + '.png';
		}
		let myIcon = L.icon({
		    iconUrl: url,
		    iconSize: [38, 38],
		    iconAnchor: [20, 20],
		    popupAnchor: [-3, -25]
		});

		let marker = L.marker([row.lat, row.lon], {icon: myIcon}).addTo(map);
		if ( settings['mode'] == 'badgemode' ) {
			var html = '<center><strong style="font-size: 20px;">' + row.name + '</strong><br>'+
				'<img src="' + row.url.replace(/^http:/, '') + '" style="width: 100px; height: 100px; background-size: cover; border-radius: 50px; margin: 6px;" />' +
				'<br>' + 
                "<a style='position: relative; float: left; font-size: 20px;' href=\"javascript:window.open('https://www.google.com/maps/dir/?api=1&destination="+row.lat+","+row.lon+"', '_blank');\">directions</a>" +
                "<a style='position: relative; float: right; font-size: 20px;' href=\"javascript:hideMarker('"+row.id+"')\">hide</a>" +
            	'<br>' + 
                '<br>' + 
                '<br>' + 
                '<img src="unknown.png" onclick="setBadgeXP(null, \''+row.id+'\')" style="max-width: 30px"; />' + 
				'<img src="new.png" onclick="setBadgeXP(0, \''+row.id+'\')" style="max-width: 30px"; />'+
				'<img src="bronze.png" onclick="setBadgeXP(500, \''+row.id+'\')" style="max-width: 30px"; />' +
				'<img src="silver.png" onclick="setBadgeXP(4000, \''+row.id+'\')" style="max-width: 30px"; />' +
				'<img src="almostgold.png" onclick="setBadgeXP(29000, \''+row.id+'\')" style="max-width: 30px"; />' +
				'<img src="gold.png"  onclick="setBadgeXP(30000, \''+row.id+'\')"  style="max-width: 30px"; />' +
				'</center>';
		} else {
			var html = '<center><strong style="font-size: 20px;">' + row.name + '</strong><br>'+
				'<img src="' + row.url.replace(/^http:/, '') + '" style="width: 100px; height: 100px; background-size: cover; border-radius: 50px; margin: 6px;" />' +
				'<br>' + 
                "<a style='position: relative; float: left; font-size: 20px;' onclick=\"jwindow.open('https://www.google.com/maps/dir/?api=1&destination="+row.lat+","+row.lon+"', '_blank'); return false;\">directions</a>" +
                "<a style='position: relative; float: right; font-size: 20px;' onclick=\"return hideMarker('"+row.id+"')\">hide</a>" +
            	'<br>' + 
                '<br>' + 
                '<br>' + 
				'<input type="number" placeholder="Gym XP" onchange="setBadgeXP(this, \'' + row.id + '\')"'+((typeof save.gyms[row.id] != 'undefined') ? ' value="'+save.gyms[row.id].xp+'"' : '')+'></input>' + 
				'</center>';
		}
        

        var showGym = 1;
        if(settings['gymsettings'] == 'onlygold') {
            showGym = typeof save.gyms[row.id] != 'undefined' && save.gyms[row.id].badge == 'gold' ? 1 : 0;
        } else if(settings['gymsettings'] == 'onlyneargold') {
            showGym = typeof save.gyms[row.id] != 'undefined' && save.gyms[row.id].badge == 'almostgold' ? 1 : 0;
        } else if(settings['gymsettings'] == 'onlynew') {
            showGym = typeof save.gyms[row.id] == 'undefined' || save.gyms[row.id].badge == 'unknown' ? 1 : 0;
        } else if(settings['gymsettings'] == 'hidegold') {
            showGym = typeof save.gyms[row.id] == 'undefined' || save.gyms[row.id].badge != 'gold' ? 1 : 0;
        } else if(settings['gymsettings'] == 'farfromgold') {
            showGym = typeof save.gyms[row.id] == 'undefined' || (save.gyms[row.id].badge != 'almostgold' && save.gyms[row.id].badge != 'gold') ? 1 : 0;
        }
            

        marker.setOpacity(showGym);        
        if(showGym) {
            marker.bindPopup(html , {'maxWidth': 200, 'minWidth': 200});
            marker.bindTooltip(row.name);
        }
		markers[row.id] = marker;

	});
});

function hideMarker(id) {
    markers[id].setOpacity(0);
    markers[id].closePopup();
    markers[id].unbindPopup();
    markers[id].unbindTooltip();
    return false;
}
