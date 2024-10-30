@ECHO OFF
git add .
git commit -m "%*"
git push -u origin main
echo "Commited Successfully."