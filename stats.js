
$('<div>').attr('id', 'statsbutton').appendTo('#map')
	.on('click', e =>{
        $("#stats").css({display: 'grid'});
        
        var statsTable = $('<table border="1" style="border-collapse: collapse;"><tr><th>Datum</th><th>Total XP</th><th># import-<br>erade gym</th><th># guld</th><th>Total<br># gym</th><th>klar av<br>importerade</th><th>klar av<br>total</th><th>Hastighet</th><th>Dagar kvar med<br>nuvarande fart</th><th>Dagar kvar med<br>normalfart</th></tr></table>');
        statsTable.attr('cellpadding', '10px');
        
        var lastDate = null;
        var lastXP = 0;
        for(var i in save.stats[settings['city']]) {
            var row = $('<tr>');
            $('<td>').text(i).appendTo(row);
            $('<td>').text(save.stats[settings['city']][i]['totalXP'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")).appendTo(row);
            $('<td>').text(save.stats[settings['city']][i]['numberOfImportedGyms']).appendTo(row);
            $('<td>').text(save.stats[settings['city']][i]['numberOfGoldBadges']).appendTo(row);
            $('<td>').text(save.stats[settings['city']][i]['totalNumberOfGyms']).appendTo(row);   
            $('<td>').text(parseFloat(save.stats[settings['city']][i]['percentageOfImported']).toFixed(2) + '%').appendTo(row);
            $('<td>').text(parseFloat(save.stats[settings['city']][i]['percentageOfTotal']).toFixed(2) + '%').appendTo(row);

            var speed = '';
            var daysRemaning = '';
            var daysRemaning2 = '';
            if (lastDate != null) {
                const date1 = new Date(i);
                const date2 = new Date(lastDate);
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                var xpDiff = Math.abs(save.stats[settings['city']][i]['totalXP'] - lastXP);
                speed = parseFloat((xpDiff / diffDays) / 30000 * 100).toFixed(0);
                
                var xpGainPerDay = (xpDiff / diffDays);
                var totalXP = save.stats[settings['city']][i]['totalNumberOfGyms'] *  30000;
                var remainingXP = totalXP - save.stats[settings['city']][i]['totalXP'];
                daysRemaning = Math.round(remainingXP / xpGainPerDay);
                
                daysRemaning2 = Math.round(remainingXP / 30000);
            }
            lastDate = i;
            lastXP = save.stats[settings['city']][i]['totalXP'];
            
            $('<td>').text(speed != '' ? (speed + '%') : '').appendTo(row);
            $('<td>').text(daysRemaning).appendTo(row);
            $('<td>').text(daysRemaning2).appendTo(row);
            row.appendTo(statsTable);
        }
        $("#stats p").empty().append(statsTable);
    });


$('<div>').attr('id', 'stats').append($('<p>')).appendTo('body');
$('<button>').text('Close').appendTo('#stats').on('click', () => $("#stats").hide());
