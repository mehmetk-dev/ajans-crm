---
name: PULL_REQUEST_TEMPLATE
about: PR check listesi
---

## Degisiklik

<!-- Bu PR hangi degisikligi yapiyor? -->

## Davranis Etkisi

- [ ] Bu PR yalnizca refactor, davranis degismiyor
- [ ] Bu PR davranis degistiriyor (asagida aciklandi)

## Kontrol Listesi

- [ ] CI yesil (lint, test, build)
- [ ] Yeni `any` kullanimi eklenmedi
- [ ] Controller -> repository bagimliligi eklenmedi
- [ ] Yeni kod hedef mimari sinirlarina uygun
- [ ] Feature boundary ihlali yok
- [ ] Dosya boyutlari sert inceleme esiginin altinda
- [ ] Testler eklendi (unit/integrasyon/component)
- [ ] E2E kritik akislar etkilenmedi
- [ ] Eski kod/facade temizlendi
- [ ] Git diff temiz

## Test Kaniti

<!-- Test sonuclari, coverage veya manuel dogrulama ekran goruntuleri -->
