# Формула расчета калькулятора цен

## Входные переменные:
- `qty` - количество товара (от пользователя)
- `slug` - идентификатор услуги
- `selection` - выбранные параметры (Size, Sides, Paper, etc.)
- `extras` - дополнительные опции (turnaround, delivery)

---

## ШАГ 1: Выбор основного тира (baseUnitPrice)

```
IF qty < sortedTiers[0].qty THEN
    selectedTier = sortedTiers[0]  // Используем минимальный тир
    baseUnitPrice = selectedTier.unit
ELSE
    // Находим максимальный тир, для которого qty >= tier.qty
    selectedTier = максимальный tier где qty >= tier.qty
    baseUnitPrice = selectedTier.unit
END IF
```

**Пример:**
- Тиры: [100: £0.50, 250: £0.45, 500: £0.40]
- qty = 100
- selectedTier = {qty: 100, unit: 0.50}
- baseUnitPrice = 0.50

---

## ШАГ 2: Расчет базовой цены (basePrice)

```
IF qty < sortedTiers[0].qty THEN
    basePrice = sortedTiers[0].unit × qty
ELSE
    basePrice = baseUnitPrice × qty
END IF
```

**Пример:**
- baseUnitPrice = 0.50
- qty = 100
- basePrice = 0.50 × 100 = £50.00

---

## ШАГ 3: Расчет модификаторов из базы данных (modifierTotal)

```
modifierTotal = 0
modifierItems = []

FOR EACH modifierRow IN modifierRows DO
    IF modifierRow.tiers.length > 0 THEN
        selectedTier = найти подходящий тир (та же логика как для baseUnitPrice)
        modifierPrice = selectedTier.unit × qty
        modifierTotal = modifierTotal + modifierPrice
        modifierItems.push({name: modifierName, price: modifierPrice})
    END IF
END FOR
```

**Пример:**
- Модификатор "Double Sided" с тиром {qty: 100, unit: 0.10}
- qty = 100
- modifierPrice = 0.10 × 100 = £10.00
- modifierTotal = 0 + 10.00 = £10.00

---

## ШАГ 4: Rush (срочность) - добавляется к modifierTotal

```
IF selection.Rush === 'same-day' THEN
    rushMultiplier = 0.20  // 20%
    rushPrice = basePrice × rushMultiplier
    modifierTotal = modifierTotal + rushPrice
    modifierItems.push({name: "Rush: Same-day", price: rushPrice})
ELSE IF selection.Rush === 'express' THEN
    rushMultiplier = 0  // или другая логика
    rushPrice = 0
END IF
```

**Пример:**
- basePrice = £50.00
- selection.Rush = 'same-day'
- rushPrice = 50.00 × 0.20 = £10.00
- modifierTotal = 10.00 + 10.00 = £20.00

---

## ШАГ 5: Ламинация (Lamination) - добавляется к modifierTotal

```
IF selection.Lamination !== 'None' THEN
    laminationPrices = {
        'Matte': 0.05,
        'Gloss': 0.08,
        'Soft Touch': 0.12
    }
    price = laminationPrices[selection.Lamination] || 0
    laminationPrice = price × qty
    modifierTotal = modifierTotal + laminationPrice
    modifierItems.push({name: "Lamination: [тип]", price: laminationPrice})
END IF
```

**Пример:**
- selection.Lamination = 'Gloss'
- price = 0.08
- qty = 100
- laminationPrice = 0.08 × 100 = £8.00
- modifierTotal = 20.00 + 8.00 = £28.00

---

## ШАГ 6: Углы (Corners) - добавляется к modifierTotal

```
IF selection.Corners === 'Rounded' THEN
    price = 0.02
    cornersPrice = price × qty
    modifierTotal = modifierTotal + cornersPrice
    modifierItems.push({name: "Rounded Corners", price: cornersPrice})
END IF
```

**Пример:**
- selection.Corners = 'Rounded'
- price = 0.02
- qty = 100
- cornersPrice = 0.02 × 100 = £2.00
- modifierTotal = 28.00 + 2.00 = £30.00

---

## ШАГ 7: Turnaround (из extras) - добавляется к modifierTotal

```
IF extras.turnaround THEN
    turnaroundPrices = {
        'Express': 0.15,
        'Same-day': 0.25
    }
    price = turnaroundPrices[extras.turnaround] || 0
    IF price > 0 THEN
        turnaroundPrice = price × qty
        modifierTotal = modifierTotal + turnaroundPrice
        modifierItems.push({name: "Turnaround: [тип]", price: turnaroundPrice})
    END IF
END IF
```

**Пример:**
- extras.turnaround = 'Express'
- price = 0.15
- qty = 100
- turnaroundPrice = 0.15 × 100 = £15.00
- modifierTotal = 30.00 + 15.00 = £45.00

---

## ШАГ 8: Доставка (Delivery) - добавляется к modifierTotal

```
IF extras.delivery THEN
    deliveryPrices = {
        'Courier': 5.00,
        'Post': 3.50
    }
    price = deliveryPrices[extras.delivery] || 0
    IF price > 0 THEN
        modifierTotal = modifierTotal + price  // НЕ умножается на qty!
        modifierItems.push({name: "Delivery: [тип]", price: price})
    END IF
END IF
```

**Пример:**
- extras.delivery = 'Courier'
- price = 5.00
- modifierTotal = 45.00 + 5.00 = £50.00

---

## ШАГ 9: Итоговая цена БЕЗ VAT (netTotal)

```
netTotal = basePrice + modifierTotal
```

**Пример:**
- basePrice = £50.00
- modifierTotal = £50.00
- netTotal = 50.00 + 50.00 = £100.00

---

## ШАГ 10: Расчет VAT

```
VAT_RATE = 0.20  // 20%
vat = netTotal × VAT_RATE
```

**Пример:**
- netTotal = £100.00
- VAT_RATE = 0.20
- vat = 100.00 × 0.20 = £20.00

---

## ШАГ 11: Итоговая цена С VAT (grossTotal)

```
grossTotal = netTotal + vat
```

**Пример:**
- netTotal = £100.00
- vat = £20.00
- grossTotal = 100.00 + 20.00 = £120.00

---

## ШАГ 12: Цена за единицу (finalUnitPrice)

```
finalUnitPrice = grossTotal ÷ qty
```

**Пример:**
- grossTotal = £120.00
- qty = 100
- finalUnitPrice = 120.00 ÷ 100 = £1.20

---

## ФИНАЛЬНАЯ ФОРМУЛА (одной строкой):

```
grossTotal = (baseUnitPrice × qty + Σ(modifierPrice_i × qty) + rushPrice + deliveryPrice) × 1.20

Где:
- baseUnitPrice = unit из выбранного тира
- modifierPrice_i = unit из каждого модификатора × qty
- rushPrice = basePrice × 0.20 (если same-day)
- deliveryPrice = фиксированная сумма (не умножается на qty)
```

---

## ПРОБЛЕМА В ТЕКУЩЕМ РАСЧЕТЕ:

Если в админке указано:
- 100 шт по £0.50 = £60.00 total (с VAT)

То должно быть:
- basePrice = 0.50 × 100 = £50.00
- netTotal = £50.00
- vat = 50.00 × 0.20 = £10.00
- grossTotal = 50.00 + 10.00 = £60.00 ✓

Но калькулятор показывает:
- netTotal = £10.00 (неправильно!)
- Это означает basePrice = £10.00, что равно 100 × 0.10

**Вывод:** Выбирается тир с unit = £0.10 вместо £0.50
