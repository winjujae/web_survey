import { Repository } from "typeorm";
import { Post } from "./posts.entity";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class PostRepository extends Repository<Post>{
    constructor(private dataSource: DataSource){
        super(Post, dataSource.createEntityManager());
    };
    async
}