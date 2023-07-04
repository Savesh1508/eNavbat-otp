const dates = {
    convert: function(data) {
        return data.constructor === Date // 2000-01-01
        ? data
        : data.constructor === Array // [2000,01,01]
        ? new Date(data[0], data[1], data[2])
        : data.constructor === Number //234984328998
        ? new Date(data)
        : typeof data === "object"
        ? new Date(data.year, data.month, data.date)
        : NaN
    },

    compare: function (a, b) {
        return isFinite((a = this.convert(a).valueOf())) && isFinite((b = this.convert(b).valueOf()))
        ? (a > b) - (a < b)
        : NaN
    },

    inRange: function (d, start, end) {
        return isFinite((d = this.convert(d).valueOf())) &&
            isFinite((start = this.convert(start).valueOf())) &&
            isFinite((end = this.convert(end).valueOf()))
            ? start <= d && d <= end
            : NaN;
    },
};

module.exports = {
    dates,
}