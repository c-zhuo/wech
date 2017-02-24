'use strict';

var dateFormat = function (t, format) {
    var time = t;
    if (typeof time === 'string') {
        time = parseInt(time);
    }

    var d = new Date(time);
    var yyyy = String(d.getYear() + 1900);

    var mm = '';
    if (d.getMonth() < 9) {
        mm += '0';
    }
    mm += (1 + d.getMonth());

    var dd = '';
    if (d.getDate() < 10) {
        dd += '0';
    }
    dd += d.getDate();

    var HH = '';
    if (d.getHours() < 10) {
        HH += '0';
    }
    HH += d.getHours();

    var MM = '';
    if (d.getMinutes() < 10) {
        MM += '0';
    }
    MM += d.getMinutes();

    var SS = '';
    if (d.getSeconds() < 10) {
        SS += '0';
    }
    SS += d.getSeconds();

    var res = format.replace('YYYY', yyyy).replace('MM', mm).replace('DD', dd)
            .replace('hh', HH).replace('mm', MM).replace('ss', SS);

    // res = res.replace('Y', yyyy).replace('M', (1 + d.getMonth())).replace('D', d.getDate())
    //     .replace('h', d.getHours()).replace('m', d.getMinutes()).replace('s', d.getSeconds());
    return res;
};

module.exports = dateFormat;
