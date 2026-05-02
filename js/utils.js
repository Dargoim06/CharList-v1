// Глобальные функции
function getMod(statId) {
    let v = parseInt(document.getElementById(statId).value) || 10;
    return Math.floor((v - 10) / 2);
}

function getProfBonus() {
    return parseInt(document.getElementById('profBonus').value) || 2;
}

function parseDamage(damageStr) {
    if (!damageStr) return null;
    let m = damageStr.toLowerCase().replace(/к/g, 'd').match(/(\d*)d(\d+)([+-]\d+)?/);
    if (!m) return null;
    return {
        count: m[1] === '' ? 1 : parseInt(m[1]),
        sides: parseInt(m[2]),
        mod: m[3] ? parseInt(m[3]) : 0
    };
}

// Показывает модальное окно с результатом
function showRollResultModal(title, total, dieResult, bonus, diceNotation) {
    const modal = document.getElementById('rollResultModal');
    if (!modal) return;

    // Заполняем данные
    modal.querySelector('.roll-title').textContent = title.toUpperCase();
    modal.querySelector('.roll-result').textContent = total;
    
    // Формируем строку формулы: (Результат) + Бонус
    let formulaText = `(${dieResult})`;
    if (bonus !== undefined && bonus !== 0) {
        formulaText += ` ${bonus > 0 ? '+' : ''}${bonus}`;
    }
    modal.querySelector('.roll-main').textContent = formulaText;

    // Подпись: (1к20) + 2
    let subText = `(${diceNotation})`;
    if (bonus !== undefined && bonus !== 0) {
        subText += ` ${bonus > 0 ? '+' : ''}${bonus}`;
    }
    modal.querySelector('.roll-sub').textContent = subText;

    // Бейдж
    const badge = modal.querySelector('.roll-badge');
    badge.style.color = "#e6b87e";
    
    // Проверка на крит (если бросок d20)
    if (diceNotation && (diceNotation.includes('20') || diceNotation.includes('d20') || diceNotation.includes('к20'))) {
        // Если результат >= 20 и на кубике выпало 20 (учитываем, что dieResult может быть строкой "3+4" для урона, но для атаки это число)
        if (typeof dieResult === 'number' && dieResult === 20) {
             badge.textContent = "КРИТ!";
             badge.style.color = "#ff4444";
        } else if (typeof dieResult === 'number' && dieResult === 1) {
             badge.textContent = "КРИТ ПРОМАХ";
             badge.style.color = "#ff4444";
        } else {
             badge.textContent = "БРОСОК";
        }
    } else {
        // Для урона или других бросков
        badge.textContent = title.toLowerCase().includes("урон") ? "УРОН" : "РЕЗУЛЬТАТ";
    }

    // Показываем
    modal.style.display = 'flex';
}

// Закрытие модального окна
function closeRollModal() {
    const modal = document.getElementById('rollResultModal');
    if (modal) modal.style.display = 'none';
}

function rollDamage(damageStr, addToLogCallback, title = "Урон") {
    let parsed = parseDamage(damageStr);
    if (!parsed) {
        addToLogCallback(`❌ ${damageStr} не распознано`);
        return null;
    }
    let totalDice = 0, rolls = [];
    for (let i = 0; i < parsed.count; i++) {
        let r = Math.floor(Math.random() * parsed.sides) + 1;
        rolls.push(r);
        totalDice += r;
    }
    let total = totalDice + parsed.mod;
    
    // Показываем модалку
    // dieResult - сумма кубиков (например "3+4" или просто число если 1 кубик)
    let displayDice = rolls.join('+');
    showRollResultModal(title, total, displayDice, parsed.mod, `${parsed.count}к${parsed.sides}`);
    
    addToLogCallback(`🎲 Урон: ${rolls.join('+')}${parsed.mod >= 0 ? '+' + parsed.mod : parsed.mod}=${total}`);
    return total;
}

function rollD20(bonus, label, addToLogCallback) {
    let die = Math.floor(Math.random() * 20) + 1;
    let roll = die + bonus;
    // Показываем модалку
    showRollResultModal(label, roll, die, bonus, "1к20");
    addToLogCallback(`🎲 ${label}: 1d20${bonus >= 0 ? '+' : ''}${bonus}=${roll}`);
    return roll;
}

function upgradeDamage(damageStr, extraDice) {
    if (extraDice <= 0) return damageStr;
    let parsed = parseDamage(damageStr);
    if (!parsed) return damageStr;
    let newCount = parsed.count + extraDice;
    if (newCount < 1) newCount = 1;
    let modStr = parsed.mod >= 0 ? `+${parsed.mod}` : `${parsed.mod}`;
    return `${newCount}к${parsed.sides}${modStr}`;
}
