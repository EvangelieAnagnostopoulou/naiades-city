const getColorBetween = function(fromColor, toColor, ratio) {
    const hex = function(x) {
        x = x.toString(16);
        return (x.length === 1) ? '0' + x : x;
    };
    const hexBetween = function(offset) {
        return Math.ceil(
            parseInt(fromColor.substring(offset, offset + 2), 16) * (1 - ratio) +
            parseInt(toColor.substring(offset, offset + 2), 16) * ratio
        )
    };

    const r = hexBetween(1);
    const g = hexBetween(3);
    const b = hexBetween(5);

    return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const getGreenRedScaleColor = function(ratio) {
    // if (ratio === 0) {
    //     return '#999';
    // }

    if (ratio < 0.5) {
        return getColorBetween('#04D215', '#ffdb01', ratio * 2)
    } else {
        return getColorBetween('#ffdb01', '#FF0F00', (ratio - 0.5) * 2)
    }
};
