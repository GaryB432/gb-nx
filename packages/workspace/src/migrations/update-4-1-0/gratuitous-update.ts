import { type Tree } from '@nx/devkit';

export default function update(host: Tree): void {
  host.write('gb-nx.txt', 'thanks for using');
}
