/**
 * fileIcons.js — Icon rendering helpers for VisCenter (v2)
 * Supports: type-based icons, emoji presets, custom image (base64)
 */
var FileIcons = (function () {
    var emojiMap = {
        star: '⭐',
        palette: '🎨',
        folder: '📁',
        book: '📖',
        globe: '🌐',
        lightning: '⚡',
        diamond: '💎',
        fire: '🔥',
        flag: '🚩'
    };

    var typeMap = {
        '.ai': { cls: 'icon-ai', label: 'Ai' },
        '.pdf': { cls: 'icon-pdf', label: 'PDF' },
        '.eps': { cls: 'icon-eps', label: 'EPS' },
        '.svg': { cls: 'icon-svg', label: 'SVG' },
        'default': { cls: 'icon-default', label: 'VEC' }
    };

    function getExtension(name) {
        var parts = (name || '').split('.');
        return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
    }

    function renderIcon(fileData) {
        var icon = fileData.customIcon;
        var imgData = fileData.customImgData;
        var ext = getExtension(fileData.path || '');

        // Custom uploaded image
        if (icon === 'custom_img' && imgData) {
            return '<div class="vec-icon custom-img-icon" style="background-image:url(' + imgData + ')"></div>';
        }

        // Emoji preset
        if (icon && emojiMap[icon]) {
            return '<div class="vec-icon emoji-override">' + emojiMap[icon] + '</div>';
        }

        // PDF / EPS type badge overrides
        var iconType;
        if (icon === 'pdf') {
            iconType = typeMap['.pdf'];
        } else if (icon === 'eps') {
            iconType = typeMap['.eps'];
        } else {
            iconType = typeMap[ext] || typeMap['default'];
        }

        return '<div class="vec-icon ' + iconType.cls + '">' + iconType.label + '</div>';
    }

    return { renderIcon: renderIcon, getExtension: getExtension, emojiMap: emojiMap };
})();
