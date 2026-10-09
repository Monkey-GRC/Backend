import { osFromImage } from './os-from-image';

describe('osFromImage', () => {
  it.each([
    ['ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20240101', null, 'Ubuntu 22.04'],
    ['ubuntu/images/hvm-ssd-gp3/ubuntu-noble-amd64-server', null, 'Ubuntu 24.04'],
    ['al2023-ami-2023.5.20240805.0-kernel-6.1-x86_64', null, 'Amazon Linux 2023'],
    ['amzn2-ami-kernel-5.10-hvm-2.0.2024-x86_64-gp2', null, 'Amazon Linux 2'],
    ['Windows_Server-2022-English-Full-Base-2024.08.14', null, 'Windows Server 2022'],
    ['RHEL-9.4.0_HVM-20240605-x86_64', null, 'Red Hat Enterprise Linux 9'],
    ['debian-12-amd64-20240717-1811', null, 'Debian 12'],
    ['mi-imagen-propia-v7', 'Imagen interna', null],
    [null, null, null],
  ])('%s → %s', (name, description, expected) => {
    expect(osFromImage(name, description)).toBe(expected);
  });
});
