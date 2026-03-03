/**
 * main.js — VisCenter core panel logic (v2)
 * Fixes: open file via CSInterface, double-click on name, custom image icon
 */
(function () {
    'use strict';

    /* ── CSInterface singleton ── */
    var cs = getCSInterface();

    /* ── State ── */
    var files = [];
    var currentView = 'grid';
    var searchQuery = '';
    var activeId = null;

    /* ── DOM refs ── */
    var dropZone = document.getElementById('drop-zone');
    var fileGrid = document.getElementById('file-grid');
    var emptyState = document.getElementById('empty-state');
    var fileCount = document.getElementById('file-count');
    var searchInput = document.getElementById('search-input');
    var searchClear = document.getElementById('search-clear');
    var btnAdd = document.getElementById('btn-add');
    var btnGrid = document.getElementById('btn-grid');
    var btnList = document.getElementById('btn-list');
    var fileInput = document.getElementById('file-input');
    var ctxMenu = document.getElementById('context-menu');
    var modalOverlay = document.getElementById('modal-overlay');
    var modalInput = document.getElementById('modal-input');
    var modalCancel = document.getElementById('modal-cancel');
    var modalConfirm = document.getElementById('modal-confirm');
    var iconOverlay = document.getElementById('icon-modal-overlay');
    var iconOptions = document.querySelectorAll('.icon-option');
    var iconCancel = document.getElementById('icon-modal-cancel');
    var iconImgInput = document.getElementById('icon-img-input');
    var customImgDrop = document.getElementById('custom-img-drop');
    var customImgPreview = document.getElementById('custom-img-preview');
    var customImgHint = document.getElementById('custom-img-hint');

    /* ── Init ── */
    files = VisStorage.load();
    render();

    /* ═══════════════════════════════════════════════════════
       ADD FILES
    ═══════════════════════════════════════════════════════ */
    btnAdd.addEventListener('click', function () { fileInput.click(); });

    fileInput.addEventListener('change', function () {
        Array.from(fileInput.files).forEach(addFileFromObject);
        fileInput.value = '';
    });

    /* Drag & Drop */
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', function (e) {
        if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        Array.from(e.dataTransfer.files).forEach(addFileFromObject);
    });

    function addFileFromObject(f) {
        /* In CEP's Chromium, File objects have a non-standard .path property
           with the absolute filesystem path. Fall back to name if unavailable. */
        var path = f.path || f.name;
        var entry = {
            id: VisStorage.generateId(),
            path: path,
            displayName: f.name.replace(/\.[^.]+$/, ''),
            ext: FileIcons.getExtension(f.name),
            customIcon: null,
            customImgData: null,   // base64 data URL for custom image icons
            addedAt: Date.now()
        };
        if (VisStorage.addFile(entry)) {
            files = VisStorage.load();
            render();
        }
    }

    /* ═══════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════ */
    function render() {
        var query = searchQuery.toLowerCase().trim();
        var visible = files.filter(function (f) {
            return !query || f.displayName.toLowerCase().indexOf(query) !== -1;
        });

        fileCount.textContent = files.length + ' 个文件';
        if (query) fileCount.textContent += '（筛选: ' + visible.length + '）';

        if (files.length === 0) {
            emptyState.style.display = 'flex';
            fileGrid.innerHTML = '';
            return;
        }
        emptyState.style.display = 'none';
        fileGrid.innerHTML = visible.map(buildCard).join('');

        /* Attach events to every card */
        fileGrid.querySelectorAll('.file-card').forEach(function (card) {
            var id = card.dataset.id;
            /* Single-click anywhere on the card → open file */
            card.addEventListener('click', function (e) {
                e.stopPropagation();
                openFile(id);
            });
            card.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                showCtxMenu(e, id);
            });
        });
    }

    function buildCard(f) {
        var iconHTML = FileIcons.renderIcon(f);
        return [
            '<div class="file-card" data-id="' + f.id + '" title="' + escHtml(f.path) + '">',
            '<div class="file-icon-wrap">', iconHTML, '</div>',
            '<div class="file-name">' + escHtml(f.displayName + f.ext) + '</div>',
            '</div>'
        ].join('');
    }

    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ═══════════════════════════════════════════════════════
       VIEW TOGGLE
    ═══════════════════════════════════════════════════════ */
    btnGrid.addEventListener('click', function () { setView('grid'); });
    btnList.addEventListener('click', function () { setView('list'); });

    function setView(v) {
        currentView = v;
        dropZone.classList.toggle('view-grid', v === 'grid');
        dropZone.classList.toggle('view-list', v === 'list');
        btnGrid.classList.toggle('active', v === 'grid');
        btnList.classList.toggle('active', v === 'list');
    }
    setView('grid');

    /* ═══════════════════════════════════════════════════════
       SEARCH
    ═══════════════════════════════════════════════════════ */
    searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        searchClear.classList.toggle('hidden', !searchQuery);
        render();
    });
    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        searchQuery = '';
        searchClear.classList.add('hidden');
        render();
    });

    /* ═══════════════════════════════════════════════════════
       CONTEXT MENU
    ═══════════════════════════════════════════════════════ */
    function showCtxMenu(e, id) {
        activeId = id;
        var mw = 190, mh = 160;
        var pw = document.documentElement.clientWidth;
        var ph = document.documentElement.clientHeight;
        var cx = Math.min(e.clientX, pw - mw);
        var cy = Math.min(e.clientY, ph - mh);
        ctxMenu.style.left = cx + 'px';
        ctxMenu.style.top = cy + 'px';
        ctxMenu.classList.remove('hidden');
    }

    document.addEventListener('click', function () { ctxMenu.classList.add('hidden'); });
    document.addEventListener('contextmenu', function (e) {
        // hide menu if clicking outside a card
        if (!e.target.closest('.file-card')) ctxMenu.classList.add('hidden');
    });

    document.getElementById('ctx-open').addEventListener('click', function () { openFile(activeId); });
    document.getElementById('ctx-edit-name').addEventListener('click', function () { openRenameModal(activeId); });
    document.getElementById('ctx-edit-icon').addEventListener('click', function () { openIconModal(activeId); });
    document.getElementById('ctx-reveal').addEventListener('click', function () { revealFile(activeId); });
    document.getElementById('ctx-remove').addEventListener('click', function () {
        VisStorage.removeFile(activeId);
        files = VisStorage.load();
        render();
    });

    /* ═══════════════════════════════════════════════════════
       OPEN / REVEAL via ExtendScript
    ═══════════════════════════════════════════════════════ */
    function openFile(id) {
        var f = findById(id);
        if (!f) return;

        /* Normalize path for ExtendScript:
           - macOS uses POSIX paths (/Users/…)
           - Escape backslashes and double-quotes               */
        var safePath = escapePath(f.path);

        cs.evalScript('openFileInAI("' + safePath + '")', function (result) {
            if (result === 'error' || result === 'EvalScript error.') {
                alert('无法打开文件，请确认文件路径是否存在：\n' + f.path);
            }
        });
    }

    function revealFile(id) {
        var f = findById(id);
        if (!f) return;
        cs.evalScript('revealFile("' + escapePath(f.path) + '")');
    }

    function escapePath(p) {
        // Replace backslashes first, then escape double quotes
        return p.replace(/\\/g, '/').replace(/"/g, '\\"');
    }

    function findById(id) {
        return files.filter(function (x) { return x.id === id; })[0] || null;
    }

    /* ═══════════════════════════════════════════════════════
       RENAME MODAL
    ═══════════════════════════════════════════════════════ */
    function openRenameModal(id) {
        var f = findById(id);
        if (!f) return;
        modalInput.value = f.displayName;
        modalOverlay.classList.remove('hidden');
        modalInput.focus();
        modalInput.select();
    }

    modalCancel.addEventListener('click', function () { modalOverlay.classList.add('hidden'); });
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });
    modalConfirm.addEventListener('click', function () {
        var newName = modalInput.value.trim();
        if (newName && activeId) {
            VisStorage.updateFile(activeId, { displayName: newName });
            files = VisStorage.load();
            render();
        }
        modalOverlay.classList.add('hidden');
    });
    modalInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') modalConfirm.click();
        if (e.key === 'Escape') modalCancel.click();
    });

    /* ═══════════════════════════════════════════════════════
       ICON PICKER MODAL
    ═══════════════════════════════════════════════════════ */
    function openIconModal(id) {
        activeId = id;
        // Reset custom image preview
        var f = findById(id);
        if (f && f.customImgData) {
            showCustomImgPreview(f.customImgData);
        } else {
            clearCustomImgPreview();
        }
        // Mark selected preset
        iconOptions.forEach(function (opt) { opt.classList.remove('selected'); });
        if (f && f.customIcon) {
            var cur = document.querySelector('[data-icon="' + f.customIcon + '"]');
            if (cur) cur.classList.add('selected');
        }
        iconOverlay.classList.remove('hidden');
    }

    /* Preset icon click */
    iconOptions.forEach(function (opt) {
        opt.addEventListener('click', function () {
            var icon = opt.dataset.icon;
            if (!activeId) return;
            var iconVal = icon === 'default' ? null : icon;
            VisStorage.updateFile(activeId, { customIcon: iconVal, customImgData: null });
            files = VisStorage.load();
            render();
            iconOverlay.classList.add('hidden');
        });
    });

    iconCancel.addEventListener('click', function () { iconOverlay.classList.add('hidden'); });
    iconOverlay.addEventListener('click', function (e) {
        if (e.target === iconOverlay) iconOverlay.classList.add('hidden');
    });

    /* ── Custom image upload ── */
    customImgDrop.addEventListener('click', function () { iconImgInput.click(); });

    customImgDrop.addEventListener('dragover', function (e) {
        e.preventDefault();
        customImgDrop.classList.add('img-drag-over');
    });
    customImgDrop.addEventListener('dragleave', function () {
        customImgDrop.classList.remove('img-drag-over');
    });
    customImgDrop.addEventListener('drop', function (e) {
        e.preventDefault();
        customImgDrop.classList.remove('img-drag-over');
        var imgFile = e.dataTransfer.files[0];
        if (imgFile && imgFile.type.startsWith('image/')) {
            readImgAsDataURL(imgFile);
        }
    });

    iconImgInput.addEventListener('change', function () {
        var imgFile = iconImgInput.files[0];
        if (imgFile) readImgAsDataURL(imgFile);
        iconImgInput.value = '';
    });

    function readImgAsDataURL(imgFile) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataUrl = e.target.result;
            showCustomImgPreview(dataUrl);
            if (activeId) {
                VisStorage.updateFile(activeId, { customIcon: 'custom_img', customImgData: dataUrl });
                files = VisStorage.load();
                render();
                // Close modal after a brief moment to show selection
                setTimeout(function () { iconOverlay.classList.add('hidden'); }, 500);
            }
        };
        reader.readAsDataURL(imgFile);
    }

    function showCustomImgPreview(dataUrl) {
        customImgPreview.style.backgroundImage = 'url(' + dataUrl + ')';
        customImgPreview.classList.add('has-img');
        customImgHint.style.display = 'none';
    }

    function clearCustomImgPreview() {
        customImgPreview.style.backgroundImage = '';
        customImgPreview.classList.remove('has-img');
        customImgHint.style.display = 'flex';
    }

})();
