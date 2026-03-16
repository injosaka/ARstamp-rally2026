// admin.js - 管理者専用機能
(function() {
    // 1. 管理画面のスタイル（CSS）を注入
    const style = document.createElement('style');
    style.innerHTML = `
        #admin-panel { background: #333; color: white; padding: 15px; margin-top: 20px; border-radius: 10px; font-size: 12px; border: 2px solid #ffcd00; }
        .admin-row { border-bottom: 1px dotted #666; padding: 10px 0; display: flex; flex-direction: column; gap: 5px; }
        .admin-btn-group { display: flex; gap: 5px; }
        .admin-btn { padding: 8px; background: #555; border: 1px solid #777; color: white; border-radius: 4px; font-size: 9px; cursor: pointer; flex: 1; }
        .reset-item-btn { background: #a55; border-color: #f77; max-width: 60px; }
        .acquire-item-btn { background: #2a7; border-color: #4d9; max-width: 60px; }
        .export-area { width: 100%; height: 100px; margin-top: 10px; background: #000; color: #0f0; font-family: monospace; font-size: 10px; }
    `;
    document.head.appendChild(style);

    // 2. 管理パネルのHTMLを作成して挿入
    const adminDiv = document.createElement('div');
    adminDiv.id = 'admin-panel';
    adminDiv.innerHTML = `
        <strong>🔧 管理者モード (Secret Active)</strong><br>
        <div id="current-gps-info" style="margin-bottom:10px;">GPS取得中...</div>
        <div id="admin-list-container"></div>
        <button class="admin-btn" style="background:#009a49; width:100%; margin-top:15px; font-size:12px;" onclick="exportSettings()">✅ 設定を書き出し (シリアル化)</button>
        <textarea id="export-area" class="export-area" style="display:none;"></textarea>
        <button class="admin-btn" style="background:#444; width:100%; margin-top:10px;" onclick="location.reload()">🔄 画面を更新して反映</button>
        <button class="admin-btn" style="background:#a22; width:100%; margin-top:20px;" onclick="resetAdminCoords()">全データ完全初期化</button>
    `;
    document.querySelector('.container').appendChild(adminDiv);

    // 3. 管理用関数をグローバルに定義
    window.saveLoc = function(id, idx = null) {
        if (!currentLat) return;
        const c = JSON.parse(localStorage.getItem('admin_coords')) || {};
        if (idx !== null) {
            if (!c[id]) c[id] = { locations: [...targets[id].locations] };
            c[id].locations[idx] = { lat: currentLat, lng: currentLng };
        } else {
            c[id] = { lat: currentLat, lng: currentLng };
        }
        localStorage.setItem('admin_coords', JSON.stringify(c));
        alert(`${targets[id].name} を現在の座標で登録しました。`);
    };

    window.acquireSingleStamp = function(id) {
        let stamps = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (!stamps.includes(id)) {
            stamps.push(id);
            localStorage.setItem(storageKey, JSON.stringify(stamps));
            updateDisplay();
            alert(targets[id].name + ' を取得済みにしました。');
        }
    };

    window.resetSingleStamp = function(id) {
        let stamps = JSON.parse(localStorage.getItem(storageKey)) || [];
        const index = stamps.indexOf(id);
        if (index > -1) {
            stamps.splice(index, 1);
            localStorage.setItem(storageKey, JSON.stringify(stamps));
            updateDisplay();
            alert(`${targets[id].name} をリセットしました。`);
        }
    };

    window.exportSettings = function() {
        applyAdminOffsets();
        const area = document.getElementById('export-area');
        area.style.display = 'block';
        area.value = JSON.stringify(targets, null, 4);
        area.select();
        navigator.clipboard.writeText(area.value);
        alert("設定をクリップボードにコピーしました。");
    };

    window.resetAdminCoords = function() {
        if (confirm("全て初期化しますか？")) { localStorage.clear(); location.reload(); }
    };

    // 4. 管理リストの生成
    const adminContainer = document.getElementById('admin-list-container');
    for (let i = 1; i <= 13; i++) {
        const id = String(i);
        const row = document.createElement('div');
        row.className = 'admin-row';
        row.innerHTML = `<div>[${id}] ${targets[id].name}</div>`;
        const group = document.createElement('div');
        group.className = 'admin-btn-group';

        if (id === "1") {
            ["A", "B", "C"].forEach((label, idx) => {
                const btn = document.createElement('button');
                btn.className = 'admin-btn';
                btn.innerText = `登録-${label}`;
                btn.onclick = () => saveLoc('1', idx);
                group.appendChild(btn);
            });
        } else {
            const btn = document.createElement('button');
            btn.className = 'admin-btn';
            btn.innerText = `現在地を登録`;
            btn.onclick = () => saveLoc(id);
            group.appendChild(btn);
        }
        
        group.innerHTML += `
            <button class="admin-btn acquire-item-btn" onclick="acquireSingleStamp('${id}')">取得</button>
            <button class="admin-btn reset-item-btn" onclick="resetSingleStamp('${id}')">解除</button>
        `;
        row.appendChild(group);
        adminContainer.appendChild(row);
    }
})();
