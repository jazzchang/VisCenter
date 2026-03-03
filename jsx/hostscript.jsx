/**
 * hostscript.jsx — ExtendScript for VisCenter (runs inside Illustrator)
 * Handles: opening files, revealing in Finder
 */

/**
 * Open a file in Illustrator
 * @param {string} filePath - absolute path to the file
 */
function openFileInAI(filePath) {
    try {
        var f = new File(filePath);
        if (!f.exists) {
            return 'error';
        }
        app.open(f);
        return 'ok';
    } catch (e) {
        return 'error';
    }
}

/**
 * Reveal a file in Finder (macOS) or Explorer (Windows)
 */
function revealFile(filePath) {
    try {
        var f = new File(filePath);
        f.execute(); // Opens with system default handler
        return 'ok';
    } catch (e) {
        return 'error';
    }
}
