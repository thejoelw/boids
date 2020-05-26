import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Boid } from './Boid';

@Entity()
export class BoidVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne((type) => Boid, (boid) => boid.versions)
  boid: Boid;

  @Column()
  published: boolean;

  @Column()
  source: string;

  @Column()
  generatedDefinition: string;
}
