function setBadgeXP(input, gymid) {
    // figure out xp
    let xp = 0;
    if ( typeof input === 'number' ) {
        xp = input;
    } else {
        xp = parseInt($(input).val());
    }

    // figure out badge
    let badge = 'unknown';
    if (xp !== null) {
        var badgexp = {};
        badgexp[0] = 'new';
        badgexp[500] = 'bronze';
        badgexp[4000] = 'silver';
        badgexp[29000] = 'almostgold';
        badgexp[30000] = 'gold';

        for(var i in badgexp) {
            if ( i <= xp) {
                badge = badgexp[i];
            }
        }
    }

    // save and refresh data
    save.gyms[gymid] = { badge: badge, xp: xp };
       localStorage.setItem('save', JSON.stringify(save));
    updateStatistics();
    markers[gymid].fire('refreshGym');
}

function hideMarker(id) {
    markers[id].remove();
    return false;
}

function refreshGym() {
    let gym = this;
    markers[gym.id].remove();

    var showGym = true;

    // hide gym depending on xp
    let xp = 0;
    if (typeof save.gyms[gym.id] !== 'undefined') {
        if( settings['mode'] == 'badgemode' && save.gyms[gym.id].badge !== 'unknown') {
            console.log(save.gyms[gym.id].badge);
            switch (save.gyms[gym.id].badge) {
                case 'new':
                    xp = 0;
                    break;
                case 'bronze':
                    xp = 1000;
                    break;
                case 'silver':
                    xp = 4000;
                    break;
                case 'almostgold':
                    xp = 29000;
                    break;
                case 'gold':
                    xp = 30000;
                    break;
            }

            if ( typeof settings['min-xp'] !== 'undefined' && settings['min-xp'] !== null && settings['min-xp'] !== '' && xp < parseInt(settings['min-xp']) ) {
                showGym = false;
            }

            if ( typeof settings['max-xp'] !== 'undefined' && settings['max-xp'] !== null && settings['max-xp'] !== '' && xp > parseInt(settings['max-xp'])  ) {
                showGym = false;
            }
        } else if( settings['mode'] == 'xpmode' && save.gyms[gym.id].xp !== null) {
            xp = save.gyms[gym.id].xp;

            if ( typeof settings['min-xp'] !== 'undefined' && settings['min-xp'] !== null && settings['min-xp'] !== '' && xp < parseInt(settings['min-xp']) ) {
                showGym = false;
            }

            if ( typeof settings['max-xp'] !== 'undefined' && settings['max-xp'] !== null && settings['max-xp'] !== '' && xp > parseInt(settings['max-xp'])  ) {
                showGym = false;
            }
        }
    }


    // hide gyms with too few free slots
    if (typeof settings['free-slots'] !== 'undefined' && settings['free-slots'] !== null && settings['free-slots'] !== '' && parseInt(settings['free-slots']) !== 0) {
        let team_name = 'uncontested';
        if ( gym.team_id == 1 ) {
            team_name = 'mystic';
        } else if ( gym.team_id == 2 ) {
            team_name = 'valor';
        } else if (gym.team_id == 3 ) {
            team_name = 'instinct';
        }

        if (settings['team'] != team_name) {
            if (!settings['takeover']) {
                showGym = false;
            }
        } else {
            if (gym.available_slots < parseInt(settings['free-slots']) ) {
                showGym = false;
            }
        }
    }

    // hide gyms depending on how long my team can be in them
    let time = 0;
    if (settings['team'] == 'mystic') {
        time = gym.bs;
    } else if (settings['team'] == 'valor') {
        time = gym.rts
    } else if (settings['team'] == 'instinct') {
        time = gym.ys;
    };

    if ( typeof settings['min-time'] !== 'undefined' && settings['min-time'] !== null && settings['min-time'] !== '' && time < parseInt(settings['min-time']) ) {
        showGym = false;
    }

    if ( typeof settings['max-time'] !== 'undefined' && settings['max-time'] !== null && settings['max-time'] !== '' && time > parseInt(settings['max-time'])  ) {
        showGym = false;
    }

    if(!showGym) {
        return;
    }

    let url = 'unknown.png';
    if ( typeof save.gyms[gym.id] !== 'undefined' && typeof save.gyms[gym.id]['badge'] !== 'undefined' ) {
        url = save.gyms[gym.id]['badge'] + '.png';
    }
    let myIcon = L.icon({
        iconUrl: url,
        iconSize: [38, 38],
        iconAnchor: [20, 20],
        popupAnchor: [-3, -25]
    });

    if ( settings['mode'] == 'badgemode' ) {
        var html = '<center><strong style="font-size: 20px;">' + gym.name + '</strong><br>'+
            '<center>'+
            '<strong>B:</strong>' + gym.bs + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.bc + '&nbsp;&nbsp;' +
            '<strong>R:</strong>' + gym.rs + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.rc + '&nbsp;&nbsp;' +
            '<strong>Y:</strong>' + gym.ys + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.yc + '&nbsp;&nbsp;' +
            '</center><br>' +
            '<img src="' + gym.url.replace(/^http:/, '') + '" style="width: 100px; height: 100px; background-size: cover; border-radius: 50px; margin: 6px;" />' +
            '<br>' +
            "<a style='position: relative; float: left; font-size: 20px;' href=\"javascript:window.open('https://www.google.com/maps/dir/?api=1&destination="+gym.lat+","+gym.lon+"', '_blank');\">directions</a>" +
            "<a style='position: relative; float: right; font-size: 20px;' href=\"javascript:hideMarker('"+gym.id+"')\">hide</a>" +
            '<br>' +
            '<br>' +
            '<br>' +
            '<img src="unknown.png" onclick="setBadgeXP(null, \''+gym.id+'\')" style="max-width: 30px"; />' +
            '<img src="new.png" onclick="setBadgeXP(0, \''+gym.id+'\')" style="max-width: 30px"; />'+
            '<img src="bronze.png" onclick="setBadgeXP(500, \''+gym.id+'\')" style="max-width: 30px"; />' +
            '<img src="silver.png" onclick="setBadgeXP(4000, \''+gym.id+'\')" style="max-width: 30px"; />' +
            '<img src="almostgold.png" onclick="setBadgeXP(29000, \''+gym.id+'\')" style="max-width: 30px"; />' +
            '<img src="gold.png"  onclick="setBadgeXP(30000, \''+gym.id+'\')"  style="max-width: 30px"; />' +
            '</center>';
    } else {
        var html = '<center><strong style="font-size: 20px;">' + gym.name + '</strong><br>'+
            '<center>'+
            '<strong>B:</strong>' + gym.bs + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.bc + '&nbsp;&nbsp;' +
            '<strong>R:</strong>' + gym.rs + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.rc + '&nbsp;&nbsp;' +
            '<strong>Y:</strong>' + gym.ys + '<strong style="font-size: 16px; position: relative; top: 2px;">/</strong>' + gym.yc + '&nbsp;&nbsp;' +
            '</center><br>' +
            '<img src="' + gym.url.replace(/^http:/, '') + '" style="width: 100px; height: 100px; background-size: cover; border-radius: 50px; margin: 6px;" />' +
            '<br>' +
            "<a style='position: relative; float: left; font-size: 20px;' onclick=\"window.open('https://www.google.com/maps/dir/?api=1&destination="+gym.lat+","+gym.lon+"', '_blank'); return false;\">directions</a>" +
            "<a style='position: relative; float: right; font-size: 20px;' onclick=\"return hideMarker('"+gym.id+"')\">hide</a>" +
            '<br>' +
            '<br>' +
            '<br>' +
            '<input type="number" placeholder="Gym XP" onchange="setBadgeXP(this, \'' + gym.id + '\')"'+((typeof save.gyms[gym.id] != 'undefined') ? ' value="'+save.gyms[gym.id].xp+'"' : '')+'></input>' +
            '</center>';
    }

    markers[gym.id]
        .setIcon(myIcon)
        .bindPopup(html , {'maxWidth': 200, 'minWidth': 200})
        .bindTooltip(gym.name)
        .addTo(map);
}
