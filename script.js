var map = L.map('map');
navigator.geolocation.getCurrentPosition(function(position) {
    map.setView([position.coords.latitude, position.coords.longitude], 15);
});

var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9oYW5tbGciLCJhIjoiY2xma2hmenR5MGIzMjNxbHFsc2didmtpNSJ9.-E57rIXCzVKCrJsSHbecLw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

$('<div>').attr('id', 'locationbutton').appendTo('#map')
    .on('click', function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setView([position.coords.latitude, position.coords.longitude], 15);
        });       
    });


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
    settings['min-xp'] = null;
    settings['max-xp'] = null;
    settings['mode'] = 'badgemode';
    settings['team'] = 'mystic';
    settings['min-time'] = null;
    settings['max-time'] = null;
    localStorage.setItem('settings', JSON.stringify(settings));
} else {
    settings = JSON.parse(settings);
    if (typeof settings['team'] == 'undefined' || settings['team'] === null) {
        settings['team'] = 'mystic';
    }
}

var markers = {}
$.get('defs/' + settings['city'] + '.json', function(res) {
    $(res).each(function(i, row) {
        if ( row.name === null ) {
            return;
        }
        markers[row.id] = L.marker([row.lat, row.lon]).on('refreshGym', refreshGym, row);
        markers[row.id].fire('refreshGym');
    });
});
