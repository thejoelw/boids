import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Boid } from './Boid';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @OneToMany((type) => Boid, (boid) => boid.owner)
  boids: Boid[];
}
