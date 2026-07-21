# Anleitung: Zugriff per SSH-Keys

Diese Anleitung beschreibt, wie du SSH-Keys erzeugst, beim Git-Hoster (GitHub/GitLab/Bitbucket) hinterlegst und für den Zugriff auf Repositories bzw. Server nutzt. SSH-Keys sind die empfohlene Alternative zur Passwort-Authentifizierung, die von den meisten Anbietern nicht mehr unterstützt wird.

## Was ist ein SSH-Key?

Ein SSH-Key besteht aus zwei zusammengehörigen Dateien (einem *Schlüsselpaar*):

- **Privater Schlüssel** (`id_ed25519`) – bleibt **geheim** auf deinem Rechner. Niemals weitergeben!
- **Öffentlicher Schlüssel** (`id_ed25519.pub`) – wird beim Git-Hoster oder auf dem Zielserver hinterlegt.

Beim Verbindungsaufbau beweist dein Rechner über den privaten Schlüssel seine Identität, ohne dass ein Passwort übertragen wird.

## 1. Vorhandene Keys prüfen

Prüfe zuerst, ob bereits ein SSH-Key existiert:

```bash
ls -al ~/.ssh
```

Existiert bereits eine Datei wie `id_ed25519.pub` (oder `id_rsa.pub`), kannst du diese weiterverwenden und mit **Schritt 3** fortfahren.

## 2. Neuen SSH-Key erzeugen

Erzeuge ein modernes ed25519-Schlüsselpaar (empfohlen). Ersetze die E-Mail durch deine eigene:

```bash
ssh-keygen -t ed25519 -C "deine-email@example.com"
```

- **Speicherort**: Standard (`~/.ssh/id_ed25519`) mit `Enter` bestätigen.
- **Passphrase**: Optional, aber empfohlen – schützt den privaten Schlüssel zusätzlich.

> Hinweis: Auf sehr alten Systemen ohne ed25519-Unterstützung stattdessen:
> `ssh-keygen -t rsa -b 4096 -C "deine-email@example.com"`

## 3. SSH-Agent starten und Key hinzufügen

Der SSH-Agent verwaltet deine Schlüssel und merkt sich die Passphrase für die Sitzung:

```bash
# Agent starten
eval "$(ssh-agent -s)"

# Privaten Schlüssel zum Agent hinzufügen
ssh-add ~/.ssh/id_ed25519
```

## 4. Öffentlichen Schlüssel kopieren

Gib den öffentlichen Schlüssel aus und kopiere den **gesamten** Inhalt:

```bash
cat ~/.ssh/id_ed25519.pub
```

Die Ausgabe beginnt mit `ssh-ed25519 ...` und endet mit deiner E-Mail.

## 5a. Öffentlichen Schlüssel beim Git-Hoster hinterlegen

**GitHub:**

1. `Settings` → `SSH and GPG keys` → `New SSH key`
2. Titel vergeben (z. B. „Arbeitslaptop"), Schlüssel einfügen, speichern.

**GitLab:**

1. `Preferences` → `SSH Keys`
2. Schlüssel einfügen, ggf. Ablaufdatum setzen, speichern.

**Bitbucket:**

1. `Personal settings` → `SSH keys` → `Add key`
2. Schlüssel einfügen, speichern.

## 5b. Öffentlichen Schlüssel auf einem Server hinterlegen (optional)

Für den SSH-Zugriff auf einen eigenen Server:

```bash
ssh-copy-id benutzer@server-adresse
```

Alternativ den Inhalt von `id_ed25519.pub` manuell an `~/.ssh/authorized_keys` auf dem Server anhängen.

## 6. Verbindung testen

**GitHub:**

```bash
ssh -T git@github.com
```

Erwartete Ausgabe: `Hi <BENUTZER>! You've successfully authenticated ...`

**GitLab:**

```bash
ssh -T git@gitlab.com
```

**Server:**

```bash
ssh benutzer@server-adresse
```

## 7. Git-Repository auf SSH umstellen

Wenn ein Repository bislang über HTTPS eingebunden ist, die Remote-URL auf SSH umstellen:

```bash
# Aktuelle Remote-URL prüfen
git remote -v

# Auf SSH umstellen (Beispiel GitHub)
git remote set-url origin git@github.com:BENUTZER/REPO.git
```

Bei einem neuen Repository direkt mit SSH klonen:

```bash
git clone git@github.com:BENUTZER/REPO.git
```

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| `Permission denied (publickey)` | Öffentlicher Schlüssel nicht (korrekt) hinterlegt oder falscher Key im Agent (`ssh-add -l` prüfen). |
| `Invalid username or token. Password authentication is not supported` | Remote nutzt noch HTTPS – mit `git remote set-url` auf SSH umstellen. |
| Passphrase wird jedes Mal abgefragt | Key mit `ssh-add ~/.ssh/id_ed25519` in den Agent laden. |
| Falscher/mehrere Keys | Verbindung mit `ssh -vT git@github.com` debuggen. |

## Kurz-Referenz

```bash
ls -al ~/.ssh                                   # vorhandene Keys prüfen
ssh-keygen -t ed25519 -C "mail@example.com"     # Key erzeugen
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519  # Agent + Key
cat ~/.ssh/id_ed25519.pub                       # öffentlichen Key anzeigen
ssh -T git@github.com                           # Verbindung testen
git remote set-url origin git@github.com:BENUTZER/REPO.git  # auf SSH umstellen
```
