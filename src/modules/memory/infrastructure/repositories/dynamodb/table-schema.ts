import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

export const memoryTableSchema: CreateTableCommandInput = {
  TableName: 'Memory',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'type', AttributeType: 'S' },
    { AttributeName: 'agentId', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'S' },
    { AttributeName: 'source', AttributeType: 'S' },
    { AttributeName: 'context', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'TypeIndex',
      KeySchema: [
        { AttributeName: 'type', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
    {
      IndexName: 'AgentIndex',
      KeySchema: [
        { AttributeName: 'agentId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
    {
      IndexName: 'MetadataIndex',
      KeySchema: [
        { AttributeName: 'source', KeyType: 'HASH' },
        { AttributeName: 'context', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }
  ],
  BillingMode: 'PROVISIONED',
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES',
  },
  SSESpecification: {
    Enabled: true, // Enable server-side encryption
  },
  Tags: [
    {
      Key: 'Environment',
      Value: 'development',
    },
    {
      Key: 'Project',
      Value: 'AgentsAI',
    },
    {
      Key: 'Module',
      Value: 'Memory',
    },
  ],
};
