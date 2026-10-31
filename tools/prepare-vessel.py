"""Remove the source wordmark's geometry and unused binary data from a supplied GLB."""
import argparse, json, struct
from pathlib import Path

def prepare(source, destination):
 raw=Path(source).read_bytes();size=struct.unpack_from('<I',raw,12)[0]
 data=json.loads(raw[20:20+size]);offset=20+size
 binary=raw[offset+8:offset+8+struct.unpack_from('<I',raw,offset)[0]]
 for node in data['nodes']:
  if 'logo' in node.get('name','').lower():
   node.pop('mesh',None);node['name']='HullBrandingAnchor'
 used_meshes=sorted({n['mesh'] for n in data['nodes'] if 'mesh' in n})
 mesh_map={old:new for new,old in enumerate(used_meshes)}
 data['meshes']=[data['meshes'][i] for i in used_meshes]
 for node in data['nodes']:
  if 'mesh' in node:node['mesh']=mesh_map[node['mesh']]
 accessors=set()
 for mesh in data['meshes']:
  for primitive in mesh['primitives']:
   accessors.update(primitive['attributes'].values())
   if 'indices' in primitive:accessors.add(primitive['indices'])
   for target in primitive.get('targets',[]):accessors.update(target.values())
 for skin in data.get('skins',[]):
  if 'inverseBindMatrices' in skin:accessors.add(skin['inverseBindMatrices'])
 for animation in data.get('animations',[]):
  for sampler in animation.get('samplers',[]):accessors.update([sampler['input'],sampler['output']])
 accessor_map={old:new for new,old in enumerate(sorted(accessors))}
 data['accessors']=[data['accessors'][i] for i in sorted(accessors)]
 for mesh in data['meshes']:
  for primitive in mesh['primitives']:
   primitive['attributes']={k:accessor_map[v] for k,v in primitive['attributes'].items()}
   if 'indices' in primitive:primitive['indices']=accessor_map[primitive['indices']]
   for target in primitive.get('targets',[]):
    for k in target:target[k]=accessor_map[target[k]]
 for skin in data.get('skins',[]):
  if 'inverseBindMatrices' in skin:skin['inverseBindMatrices']=accessor_map[skin['inverseBindMatrices']]
 for animation in data.get('animations',[]):
  for sampler in animation.get('samplers',[]):
   for k in ['input','output']:sampler[k]=accessor_map[sampler[k]]
 refs=[]
 for accessor in data['accessors']:
  if 'bufferView' in accessor:refs.append(accessor)
  if 'sparse' in accessor:refs.extend([accessor['sparse']['indices'],accessor['sparse']['values']])
 for mesh in data['meshes']:
  for primitive in mesh['primitives']:
   ext=primitive.get('extensions',{}).get('KHR_draco_mesh_compression')
   if ext:refs.append(ext)
 for image in data.get('images',[]):
  if 'bufferView' in image:refs.append(image)
 used_views=sorted({r['bufferView'] for r in refs});view_map={old:new for new,old in enumerate(used_views)}
 packed=bytearray();views=[]
 for i in used_views:
  view=data['bufferViews'][i].copy();start=view.get('byteOffset',0);length=view['byteLength']
  packed.extend(b'\0'*((-len(packed))%4));view['byteOffset']=len(packed);view['buffer']=0
  packed.extend(binary[start:start+length]);views.append(view)
 for ref in refs:ref['bufferView']=view_map[ref['bufferView']]
 data['bufferViews']=views;data['buffers']=[{'byteLength':len(packed)}]
 data.setdefault('asset',{}).setdefault('extras',{})['barqRevision']='Original wordmark geometry removed; BarqCargo hull decals supplied by the scene.'
 js=json.dumps(data,separators=(',',':')).encode();js+=b' '*((-len(js))%4);packed.extend(b'\0'*((-len(packed))%4))
 result=struct.pack('<4sII',b'glTF',2,28+len(js)+len(packed))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(packed),b'BIN\0')+packed
 Path(destination).write_bytes(result)
 print(f'Prepared Barq vessel: {len(data["meshes"])} meshes; {len(raw)-len(result):,} bytes of unused branding data removed.')

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args();prepare(a.source,a.destination)
