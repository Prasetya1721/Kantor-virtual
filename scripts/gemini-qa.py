import subprocess, json, base64, sys, os
env = {}
for line in open("/opt/data/profiles/leadengineer/.env"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k] = v
key = env["MODELROUTER_TTS_KEY"]
img_path, q = sys.argv[1], sys.argv[2]
b64 = base64.b64encode(open(img_path, "rb").read()).decode()
payload = json.dumps({"model":"gemini-3.8-flash","messages":[{"role":"user","content":[
    {"type":"text","text":q},
    {"type":"image_url","image_url":{"url":"data:image/jpeg;base64," + b64}}]}],
    "max_tokens":150})
pf = "/tmp/qa-payload.json"
open(pf, "w").write(payload)
r = subprocess.run(["curl","-s","-m","90","https://modelrouter.id/v1/chat/completions",
  "-H",f"Authorization: Bearer {key}","-H","Content-Type: application/json",
  "-d","@" + pf], capture_output=True, timeout=120)
try:
    print(json.loads(r.stdout)["choices"][0]["message"]["content"])
except Exception:
    print("ERR", r.stdout[:200])
