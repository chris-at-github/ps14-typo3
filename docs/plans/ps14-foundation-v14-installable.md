# Requirements

### Überblick & Ziel

Die lokale Extension `packages/ps14_foundation` (Composer-Pfad-Paket, aktuell auf TYPO3 v12/v13 ausgelegt) soll so angepasst werden, dass sie sich im v14-Projekt **ohne Fehler installieren** lässt: `ddev composer install`, Aktivierung, `ddev typo3 extension:setup` und Backend-Aufruf laufen fehlerfrei.

Gemäß Absprache ist dies **Stufe 1 (nur fehlerfrei installierbar)**. Die vollständige Aktualisierung deprecateter/entfernter APIs im Laufzeitcode erfolgt **später** und ist hier explizit **out of scope**.

### Scope

**In Scope**
- Dieses Plandokument als versionierte Markdown-Datei unter `docs/plans/` im Projekt ablegen.
- Composer- und `ext_emconf.php`-Versions-Constraints auf TYPO3 v14 heben.
- **Entkopplung von `tt_address`** (per Nutzerentscheidung): die harte Abhängigkeit zum nicht installierten Fremd-Paket `friendsoftypo3/tt-address` beseitigen, sodass keine fehlende Klasse mehr referenziert wird.
- Beseitigung aller **fatalen Bootstrap-/DI-/Setup-Fehler**, die eine Installation verhindern.

**Out of Scope**
- Modernisierung deprecateter, aber noch funktionierender APIs (z. B. `TYPO3\CMS\Core\Service\FlexFormService`, Menü-Override-Verhalten, ViewHelper-/Fluid-Anpassungen) → spätere Stufe.
- Funktionale/Feature-Erweiterungen, Neugestaltung der Adress-/Öffnungszeiten-Funktionalität.
- Wiederherstellung der Adressfunktion über ein v14-kompatibles `tt_address` (bewusst verworfen).

### User Story

- Als Entwickler:in möchte ich `packages/ps14_foundation` im v14-Projekt aktivieren und einrichten können, ohne dass Composer-Konflikte, Class-not-found-Fehler oder Setup-Abbrüche auftreten, damit ich anschließend schrittweise die restliche v14-Migration durchführen kann.

### Akzeptanzkriterien

- `ddev composer install` löst die Abhängigkeiten des Pfad-Pakets ohne Constraint-Konflikt auf.
- Die Extension ist aktiv und `ddev typo3 extension:setup` läuft ohne Fatal Error durch.
- Der DI-Container baut ohne "class not found" (kein Verweis mehr auf `\FriendsOfTYPO3\TtAddress\...`).
- `ddev typo3 cache:flush` läuft fehlerfrei.
- Das Backend (`https://ps14-typo3.ddev.site/typo3`) antwortet mit HTTP 200/302.

# Technical Design

### Aktueller Zustand (Untersuchungsergebnis)

Die Extension ist als Composer-Pfad-Paket über `composer.json` (`repositories: path ./packages/*`) eingebunden. Relevante Befunde:

- **`packages/ps14_foundation/composer.json`**: `require: { "typo3/cms-core": "^12.4" }` → im v14-Projekt (`typo3/cms-core ^14.3`) nicht erfüllbar → Composer-Konflikt.
- **`ext_emconf.php`**: `constraints.depends` = `typo3 12.0.0-12.4.99` **und** `tt_address 9.0.0-9.9.99`.
- **Harter `tt_address`-Fatal-Blocker**: `Classes/Domain/Model/Address.php` → `class Address extends \FriendsOfTYPO3\TtAddress\Domain\Model\Address`. Das Paket `friendsoftypo3/tt-address` ist **nicht** in `composer.json`/`composer.lock` vorhanden und nicht installiert → beim DI-Container-Aufbau / Extbase-Persistence fatal `class not found`.
- Weitere `tt_address`-Kopplung: `Configuration/TCA/Overrides/tt_address.php` (fügt Spalten zur Tabelle `tt_address` hinzu), `Configuration/Extbase/Persistence/Classes.php` (mappt `Address::class` auf Tabelle `tt_address`), `Classes/Domain/Repository/AddressRepository.php`, `Classes/ViewHelpers/Address/EntityViewHelper.php` und `Classes/ViewHelpers/JsonLd/*` (referenzieren `Address` nur per String/`makeInstance`, kein harter `use` der fehlenden Klasse).
- **Kein Bootstrap-Blocker** (existiert weiterhin in v14, verifiziert im `vendor/`): `TextMenuContentObject` (XCLASS in `ext_localconf.php` + `Classes/ContentObject/Menu/TextMenuContentObject.php`), `StaticRouteResolver` (`Configuration/RequestMiddlewares.php`), `DataProcessorInterface`, `PageDoktypeRegistry` (`ext_tables.php`), `Core\Domain\Page`, `Typolink\LinkResultInterface`.
- **Nur deprecated (kein Blocker, später)**: `TYPO3\CMS\Core\Service\FlexFormService` (in `Classes/DataProcessing/AbstractProcessor.php`) existiert in v14 nur noch als deprecated Alias auf `Core\Configuration\FlexForm\FlexFormTools`.

### Key Decisions

- **Zielversion**: Constraints auf `typo3/cms-core: ^14.3` (analog Root-`composer.json`) anheben; `ext_emconf` `typo3` auf `14.0.0-14.99.99`.
- **`tt_address` entkoppeln statt einbinden** (Nutzerentscheidung): Die Adress-Funktion behält ihre Klassenstruktur, wird aber von der Fremd-Vererbung befreit. Konkret: `Address` erbt künftig von `\TYPO3\CMS\Extbase\DomainObject\AbstractEntity` statt von der `tt_address`-Modellklasse. Damit verschwindet der einzige harte Class-not-found-Fatal, während `AddressRepository` und die ViewHelpers (die nur per String/Repository arbeiten) unverändert weiter laden.
- **`tt_address`-TCA-Override neutralisieren**: `Configuration/TCA/Overrides/tt_address.php` und das Extbase-Mapping auf Tabelle `tt_address` (`Configuration/Extbase/Persistence/Classes.php`) referenzieren eine nicht existente Tabelle. Da `addTCAcolumns` auf eine fehlende Tabelle in v14 zu Fehlern/Warnungen führen kann, wird der Override-Inhalt entfernt bzw. abgesichert (nur ausführen, wenn `tt_address` in `$GLOBALS['TCA']` existiert) und das `tt_address`-Mapping aus der Persistence-Konfiguration entfernt.
- **Minimalprinzip**: Es werden nur die für eine fehlerfreie Installation nötigen Änderungen vorgenommen; deprecatete-aber-lauffähige APIs bleiben zunächst unangetastet (spätere Stufe).

### Proposed Changes

1. **Versions-Constraints** (`packages/ps14_foundation/composer.json`, `ext_emconf.php`): `cms-core` auf `^14.3`; `ext_emconf.constraints.depends.typo3` auf `14.0.0-14.99.99`; `tt_address`-Eintrag aus `depends` entfernen.
2. **`Address`-Modell entkoppeln** (`Classes/Domain/Model/Address.php`): Basisklasse von `\FriendsOfTYPO3\TtAddress\Domain\Model\Address` auf `\TYPO3\CMS\Extbase\DomainObject\AbstractEntity` umstellen; nur die Eigenschaften/Getter/Setter erhalten, die die Extension selbst definiert (z. B. `openingHours`, `openingHoursDescription`); geerbte tt_address-Felder, die im Code/Template zwingend gebraucht werden, ggf. lokal ergänzen — im Rahmen der reinen Installierbarkeit reicht das Entfernen der Fremd-Vererbung.
3. **`tt_address`-Konfiguration neutralisieren**: `Configuration/Extbase/Persistence/Classes.php` → `Address`→`tt_address`-Mapping entfernen; `Configuration/TCA/Overrides/tt_address.php` → Inhalt entfernen oder mit `if (isset($GLOBALS['TCA']['tt_address']))` absichern.
4. **Verifikation** über DDEV (Composer, `extension:setup`, `cache:flush`, Backend-HTTP-Status).

### File Structure

```
packages/ps14_foundation/
  composer.json                                # cms-core ^14.3
  ext_emconf.php                               # typo3 14.x, tt_address entfernt
  Classes/Domain/Model/Address.php             # extends AbstractEntity statt TtAddress
  Configuration/Extbase/Persistence/Classes.php# Address/tt_address-Mapping entfernt
  Configuration/TCA/Overrides/tt_address.php   # entfernt/abgesichert
```

### Risks

- **Fehlende geerbte tt_address-Felder**: Templates (`Resources/Private/Partials/Components/Address.html`) und JsonLd-ViewHelper greifen ggf. auf tt_address-Felder zu. Für die reine *Installierbarkeit* unkritisch (erst zur Laufzeit relevant), gehört zur späteren API-Stufe. Falls Setup/Extbase-Reflection dennoch Felder erwartet, minimal benötigte Eigenschaften direkt im lokalen `Address`-Modell ergänzen.
- **Verstecktes DB-Schema**: `ext_tables.sql` könnte Spalten für `tt_address` definieren; falls vorhanden, entsprechende `tt_address`-Zeilen entfernen, damit `extension:setup`/DB-Compare nicht auf eine fehlende Tabelle läuft (in Stage 3 mitprüfen).

# Testing

### Validierungsansatz

Rein über die DDEV-Umgebung, da es keine automatisierten Tests in der Extension gibt. Ziel: nachweisen, dass Installation, Setup und Backend fehlerfrei durchlaufen.

### Kernszenarien

1. `ddev composer install` → Pfad-Paket wird ohne Constraint-Konflikt aufgelöst.
2. `ddev typo3 extension:setup` (bzw. `ddev typo3-extension-setup`) → läuft ohne Fatal Error / ohne `class not found` durch.
3. `ddev typo3 cache:flush` → fehlerfrei (beweist erfolgreichen DI-Container-Aufbau).
4. `curl -k -s -o /dev/null -w "%{http_code}\n" https://ps14-typo3.ddev.site/typo3` → `200` oder `302`.

### Edge Cases

- Prüfen, dass keine Referenz auf `FriendsOfTYPO3\TtAddress` mehr in geladenem Code besteht (Grep über `Classes/` + `Configuration/`).
- Sicherstellen, dass `ext_tables.sql` keine `tt_address`-Spalten mehr gegen eine fehlende Tabelle anlegt (DB-Compare beim Setup ohne Fehler).
- TYPO3-Log (`var/log/`) nach dem Setup auf neue Fatals/Exceptions durchsehen (Deprecation-Warnungen sind akzeptabel und gehören zur späteren Stufe).

# Delivery Steps

### Step 1: Plandokument unter docs/plans ablegen
Der vollständige Migrationsplan liegt versioniert als Markdown-Datei im Projekt-Repository unter `docs/plans/`.

- Verzeichnis `docs/plans/` anlegen (existiert noch nicht; bestehende Pläne liegen bislang unter `docs/superpowers/plans/`).
- Datei `docs/plans/ps14-foundation-v14-installable.md` erstellen und den Inhalt dieses Plans (Requirements, Technical Design, Testing, Delivery Steps) übernehmen.
- Sicherstellen, dass die Markdown-Struktur (Überschriften, Codeblöcke, Tabellen) korrekt gerendert wird.

### Step 2: Versions-Constraints auf TYPO3 v14 heben
Die Extension deklariert v14-Kompatibilität und ist damit im Projekt installierbar (kein Composer-Konflikt mehr).

- In `packages/ps14_foundation/composer.json` `require."typo3/cms-core"` von `^12.4` auf `^14.3` ändern (analog Root-`composer.json`).
- In `packages/ps14_foundation/ext_emconf.php` `constraints.depends.typo3` von `12.0.0-12.4.99` auf `14.0.0-14.99.99` setzen.
- Den `tt_address`-Eintrag (`9.0.0-9.9.99`) aus `constraints.depends` entfernen.
- Anschließend `ddev composer install` ausführen und bestätigen, dass die Auflösung ohne Fehler durchläuft.

### Step 3: tt_address-Kopplung entkoppeln
Es gibt keinen Verweis mehr auf die nicht installierte Klasse `\FriendsOfTYPO3\TtAddress\Domain\Model\Address`; der DI-Container/Extbase lädt ohne class-not-found.

- In `Classes/Domain/Model/Address.php` die Basisklasse von `\FriendsOfTYPO3\TtAddress\Domain\Model\Address` auf `\TYPO3\CMS\Extbase\DomainObject\AbstractEntity` umstellen und die extension-eigenen Properties/Getter/Setter (`openingHours`, `openingHoursDescription`, ...) beibehalten.
- In `Configuration/Extbase/Persistence/Classes.php` das `Address`→Tabelle-`tt_address`-Mapping entfernen.
- `Configuration/TCA/Overrides/tt_address.php` entfernen oder den Inhalt mit `if (isset($GLOBALS['TCA']['tt_address'])) { ... }` absichern, damit keine Spalten gegen eine fehlende Tabelle registriert werden.
- `ext_tables.sql` prüfen und etwaige `tt_address`-Spaltendefinitionen entfernen.
- Per Grep verifizieren, dass in `Classes/` und `Configuration/` kein `FriendsOfTYPO3\TtAddress` mehr referenziert wird.

### Step 4: Installation in DDEV verifizieren
Nachweis, dass Extension-Setup, Cache und Backend im v14-Projekt fehlerfrei laufen.

- `ddev typo3 extension:setup` (bzw. `ddev typo3-extension-setup`) ausführen und auf fehlerfreien Durchlauf ohne Fatal/`class not found` prüfen.
- `ddev typo3 cache:flush` ausführen (bestätigt erfolgreichen DI-Container-Aufbau).
- Backend-Erreichbarkeit prüfen: `curl -k -s -o /dev/null -w "%{http_code}\n" https://ps14-typo3.ddev.site/typo3` → `200`/`302`.
- `var/log/` nach neuen Fatals/Exceptions durchsehen; verbleibende Deprecation-Warnungen dokumentieren als Input für die spätere API-Aktualisierungsstufe.
