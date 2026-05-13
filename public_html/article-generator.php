<div class="card">
    <h3><i class="fas fa-robot"></i> AI Artikkel-generator</h3>
    <p>La AI skrive innhold til bloggen din. Du kan redigere før publisering.</p>
    
    <form id="ai-article-form" style="margin-top:20px;">
        <div class="form-group">
            <label>Hva skal artikkelen handle om?</label>
            <input type="text" id="ai-topic" class="form-control" placeholder="Eks: Fordelene med nybygg i Alicante..." required>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Målgruppe</label>
                <input type="text" id="ai-audience" class="form-control" value="Norske boligkjøpere">
            </div>
            <div class="form-group">
                <label>Lengde</label>
                <select id="ai-length" class="form-control">
                    <option value="medium">Medium (ca 800 ord)</option>
                    <option value="short">Kort (ca 400 ord)</option>
                    <option value="long">Lang guide (1500+ ord)</option>
                </select>
            </div>
        </div>
        <button type="submit" id="ai-btn" class="btn btn-gold">Generer Utkast</button>
    </form>
    
    <div id="ai-preview" style="display:none; margin-top:30px; border-top:1px solid #eee; padding-top:20px;">
        <h3>Forhåndsvisning</h3>
        <div id="ai-content-box" style="background:#f9f9f9; padding:20px; border-radius:8px; margin-bottom:20px;"></div>
        <button id="ai-save-btn" class="btn btn-primary">Publiser Artikkel</button>
    </div>
</div>

<script>
let currentAiData = null;

document.getElementById('ai-article-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ai-btn');
    const topic = document.getElementById('ai-topic').value;
    
    btn.disabled = true; btn.innerText = "Tenker... (Dette tar ca 10 sek)";
    
    try {
        const res = await fetch('generate-article-api.php', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ topic: topic, mode: 'article' })
        });
        const data = await res.json();
        
        if(data.success) {
            currentAiData = data;
            renderPreview(data.generated_data);
            document.getElementById('ai-preview').style.display = 'block';
        } else {
            alert('Feil: ' + data.error);
        }
    } catch(err) { alert('Nettverksfeil'); }
    
    btn.disabled = false; btn.innerText = "Generer Utkast";
});

function renderPreview(data) {
    let html = `<h2>${data.headline_options[0]}</h2>`;
    html += `<p><em>${data.meta_description}</em></p><hr>`;
    
    data.content_sections.forEach(sec => {
        if(sec.type === 'text') html += `<p>${sec.content}</p>`;
        if(sec.type === 'image_prompt') html += `<div style="background:#eee; padding:10px; color:#666; font-size:0.8rem;">[Bilde-prompt: ${sec.prompt}]</div>`;
    });
    
    document.getElementById('ai-content-box').innerHTML = html;
}

document.getElementById('ai-save-btn').addEventListener('click', async () => {
    if(!currentAiData) return;
    const btn = document.getElementById('ai-save-btn');
    btn.innerText = "Lagrer...";
    
    try {
        const payload = {
            action: 'save_article', // Matches backend.php logic
            headline: currentAiData.generated_data.headline_options[0],
            meta_description: currentAiData.generated_data.meta_description,
            content_sections: JSON.stringify(currentAiData.generated_data.content_sections),
            images: currentAiData.images
        };
        
        // Vi bruker api.php for lagring (du må oppdatere api.php til å støtte dette, se under)
        const res = await fetch('api.php?endpoint=save_article', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const resData = await res.json();
        if(resData.success) {
            alert('Artikkel publisert!');
            window.location.href = 'backend.php?tab=articles';
        } else {
            alert('Feil ved lagring: ' + resData.error);
        }
    } catch(err) { console.error(err); alert('Lagringsfeil'); }
});
</script>