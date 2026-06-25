from __future__ import annotations

import os
import sys


def main() -> int:
    try:
        from PySide6.QtCore import QUrl, Qt
        from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QMessageBox, QToolBar
        from PySide6.QtWebEngineWidgets import QWebEngineView
    except ImportError:
        print("PySide6 is not installed. Install project dependencies first.")
        return 1

    app = QApplication(sys.argv)
    app.setApplicationName("Smart Windmill Control Room")

    window = QMainWindow()
    window.setWindowTitle("Smart Windmill Energy Monitoring & Analytics Platform")
    window.resize(1600, 1000)

    browser = QWebEngineView()
    dashboard_url = os.getenv("WINDMILL_DASHBOARD_URL", "http://127.0.0.1:5173")
    browser.load(QUrl(dashboard_url))
    window.setCentralWidget(browser)

    toolbar = QToolBar("Windmill")
    toolbar.setMovable(False)
    window.addToolBar(Qt.TopToolBarArea, toolbar)
    toolbar.addAction("Reload", browser.reload)
    toolbar.addAction("Home", lambda: browser.load(QUrl(dashboard_url)))
    toolbar.addAction("About", lambda: QMessageBox.information(window, "About", "Smart Windmill desktop control room"))

    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
