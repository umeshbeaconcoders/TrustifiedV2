import React from 'react';
import { 
  Package, 
  Flame, 
  Pill, 
  Zap, 
  Droplet, 
  IceCream, 
  Grid,
  Beef,
  Coffee,
  Cookie,
  Leaf,
  Gift,
  ShoppingBag
} from 'lucide-react-native';

export function CategoryIcon({ slug, color, size = 20 }: { slug: string; color: string; size?: number }) {
  let IconComponent = Grid;
  switch (slug) {
    case 'protein-powders':
      IconComponent = Package;
      break;
    case 'creatine':
      IconComponent = Flame;
      break;
    case 'omega-3':
      IconComponent = Droplet;
      break;
    case 'vitamins-minerals':
      IconComponent = Pill;
      break;
    case 'mass-gainer':
      IconComponent = Beef;
      break;
    case 'breakfast-cereals':
      IconComponent = Coffee;
      break;
    case 'protein-bars':
      IconComponent = Cookie;
      break;
    case 'nut-butters':
      IconComponent = IceCream;
      break;
    case 'preworkout':
      IconComponent = Zap;
      break;
    case 'shilajit':
      IconComponent = Leaf;
      break;
    case 'dark-chocolate':
      IconComponent = Gift;
      break;
    case 'fmcg':
      IconComponent = ShoppingBag;
      break;
    default:
      IconComponent = Grid;
      break;
  }
  return <IconComponent size={size} color={color} />;
}
