import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'karetki_rolikovie' })
export class RollerGuide {
  @PrimaryColumn({ name: 'nazvanie', type: 'varchar', length: 100 })
  name!: string;

  @Column('numeric', { name: 'radialnaya', nullable: true })
  radial?: string; // numeric приходит строкой

  @Column('numeric', { name: 'osevaya', nullable: true })
  axial?: string;

  @Column('numeric', { name: 'mx', nullable: true })
  mx?: string;

  @Column('numeric', { name: 'my', nullable: true })
  my?: string;

  @Column('numeric', { name: 'mzs', nullable: true })
  mzs?: string;

  @Column('numeric', { name: 'mzd', nullable: true })
  mzd?: string;
}
