import builder from '@rsql/builder';
import { rsqlExpressionToQuery, rsqlStringToQuery } from 'rsql-prisma';




console.log(rsqlStringToQuery('name==John'));