import re

with open('app.js', 'r') as f:
    content = f.read()

# Helper logic to insert
helper_code = """
function parseHPLore(text, shapeObj, base, vtx) {
  if(!text) return text;
  const letters = ['A','B','C','D'];
  const pCount = shapeObj.points.length;
  const baseText = letters[base] + '-' + letters[(base+1)%pCount];
  const vtxText = letters[vtx];
  return text.replace(/\\[VTX\\]/g, vtxText).replace(/\\[BASE\\]/g, baseText);
}
"""

# Find buildStages and replace all prompts
# But honestly, writing new stages with HP lore is better.
# Let's write the new 10 stages entirely via a python replacement script, or just directly in a new file and then append.
