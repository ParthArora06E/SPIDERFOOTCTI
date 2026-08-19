# SpiderFoot Test Dashboard

A Next.js dashboard to interact with a local SpiderFoot instance on Windows.

## 1. Requirements

- Windows
- Node.js
- npm
- Python 3
- SpiderFoot

## 2. Install SpiderFoot

Clone the SpiderFoot repository to a directory next to the dashboard:

```powershell
git clone https://github.com/smicallef/spiderfoot.git ..\spiderfoot-app
cd ..\spiderfoot-app
python -m pip install -r requirements.txt
```

## 3. Start SpiderFoot

From the SpiderFoot directory, run:

```powershell
python sf.py -l 127.0.0.1:8080
```

Alternatively, you can use the provided helper script from the dashboard directory:

```powershell
.\scripts\start-spiderfoot.ps1
```

## 4. Verify SpiderFoot

Ensure SpiderFoot is reachable at the configured address:

```powershell
curl http://127.0.0.1:8080
```
Or open `http://127.0.0.1:8080` in your web browser.

You can also use the included verification script:

```powershell
.\scripts\check-spiderfoot.ps1
```

## 5. Install dashboard

Open a new terminal in the `spiderfoot-dashboard` directory:

```powershell
npm install
```

## 6. Configure environment

Copy the example environment file:

```powershell
cp .env.local.example .env.local
```

Ensure `.env.local` contains:
```env
SPIDERFOOT_URL=http://127.0.0.1:8080
```

## 7. Start dashboard

```powershell
npm run dev
```

## 8. Open dashboard

Navigate to:
```text
http://localhost:3000
```

## 9. Test procedure

1. Start SpiderFoot
2. Verify SpiderFoot is online
3. Start the Next.js dashboard
4. Enter an authorized test domain (e.g. `example.com`)
5. Click Start SpiderFoot Scan
6. Confirm scan ID appears
7. Watch status change
8. Open results

**Important Security Notice**: The dashboard is intended for authorized security testing and OSINT reconnaissance only. You should only scan systems you own or are authorized to assess.
