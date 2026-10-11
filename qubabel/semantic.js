export const radians = d => d * Math.PI / 180;
const mul = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
function overlap(out,bit,theta,delta){
  // B = Rz(delta) Ry(2theta); return <out|B†|bit>.
  const c=Math.cos(theta),s=Math.sin(theta);
  const real=out===0?(bit===0?c:s):(bit===0?-s:c);
  const phase=bit===0?delta/2:-delta/2;
  return [real*Math.cos(phase),real*Math.sin(phase)];
}
export function probabilities(gamma,phase,a,b){
  const p=[];
  for(let bob=0;bob<2;bob++)for(let alice=0;alice<2;alice++){
    const x=mul([Math.cos(gamma),0],mul(overlap(alice,0,a.theta,a.delta),overlap(bob,0,b.theta,b.delta)));
    const y=mul([Math.sin(gamma)*Math.cos(phase),Math.sin(gamma)*Math.sin(phase)],mul(overlap(alice,1,a.theta,a.delta),overlap(bob,1,b.theta,b.delta)));
    const z=add(x,y); p.push(z[0]**2+z[1]**2);
  }return p;
}
export function updateBasis(basis,out){return out===0?{theta:basis.theta+radians(7)*Math.cos(basis.delta),delta:basis.delta}:{theta:basis.theta,delta:basis.delta+radians(35)};}
export function sample(p,r=Math.random()){let total=0;for(let i=0;i<p.length;i++){total+=p[i];if(r<total)return i;}return p.length-1;}
export function entropy(gamma){const p=Math.sin(gamma)**2;return p<1e-12||p>1-1e-12?0:-p*Math.log2(p)-(1-p)*Math.log2(1-p);}
