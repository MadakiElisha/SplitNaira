import { Router } from "express";
import { z } from "zod";
import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr
} from "@stellar/stellar-sdk";

import { loadStellarConfig, RequestValidationError } from "../services/stellar.js";

export const splitsRouter = Router();

const collaboratorSchema = z.object({
  address: z.string().min(1),
  alias: z.string().min(1).max(64),
  basisPoints: z.number().int().min(1).max(10_000)
});

const createSplitSchema = z
  .object({
    owner: z.string().min(1),
    projectId: z
      .string()
      .min(1)
      .max(32)
      .regex(/^[a-zA-Z0-9_]+$/, "projectId must be alphanumeric/underscore"),
    title: z.string().min(1).max(128),
    projectType: z.string().min(1).max(32),
    token: z.string().min(1),
    collaborators: z.array(collaboratorSchema).min(2)
  })
  .superRefine((payload, ctx) => {
    const totalBasisPoints = payload.collaborators.reduce(
      (sum, collaborator) => sum + collaborator.basisPoints,
      0
    );
    if (totalBasisPoints !== 10_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["collaborators"],
        message: "collaborators basisPoints must sum to 10,000"
      });
    }

    const addresses = new Set<string>();
    for (const collaborator of payload.collaborators) {
      if (addresses.has(collaborator.address)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["collaborators"],
          message: "duplicate collaborator address found"
        });
        break;
      }
      addresses.add(collaborator.address);
    }
  });

function toCollaboratorScVal(collaborator: z.infer<typeof collaboratorSchema>) {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("address", { type: "symbol" }),
      val: Address.fromString(collaborator.address).toScVal()
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("alias", { type: "symbol" }),
      val: nativeToScVal(collaborator.alias)
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("basis_points", { type: "symbol" }),
      val: xdr.ScVal.scvU32(collaborator.basisPoints)
    })
  ]);
}

async function buildCreateProjectUnsignedXdr(
  input: z.infer<typeof createSplitSchema>
) {
  const config = loadStellarConfig();
  const server = new rpc.Server(config.sorobanRpcUrl, { allowHttp: true });

  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(input.owner);
  } catch {
    throw new RequestValidationError("owner account not found on selected network");
  }

  let ownerAddress: Address;
  let tokenAddress: Address;
  try {
    ownerAddress = Address.fromString(input.owner);
    tokenAddress = Address.fromString(input.token);
  } catch {
    throw new RequestValidationError("owner/token/collaborator addresses must be valid Stellar addresses");
  }

  let collaboratorScVals: xdr.ScVal[];
  try {
    collaboratorScVals = input.collaborators.map((collaborator) =>
      toCollaboratorScVal(collaborator)
    );
  } catch {
    throw new RequestValidationError("owner/token/collaborator addresses must be valid Stellar addresses");
  }
  const contract = new Contract(config.contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase
  })
    .addOperation(
      contract.call(
        "create_project",
        ownerAddress.toScVal(),
        nativeToScVal(input.projectId, { type: "symbol" }),
        nativeToScVal(input.title),
        nativeToScVal(input.projectType),
        tokenAddress.toScVal(),
        xdr.ScVal.scvVec(collaboratorScVals)
      )
    )
    .setTimeout(300)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  return {
    xdr: preparedTx.toXDR(),
    metadata: {
      contractId: config.contractId,
      networkPassphrase: config.networkPassphrase,
      sourceAccount: input.owner,
      sequenceNumber: preparedTx.sequence,
      fee: preparedTx.fee,
      operation: "create_project"
    }
  };
}

splitsRouter.get("/:projectId", (req, res) => {
  res.status(501).json({
    error: "not_implemented",
    message: `Split project ${req.params.projectId} is not wired yet.`
  });
});

splitsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createSplitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        message: "Invalid request payload.",
        details: parsed.error.flatten()
      });
    }

    try {
      const result = await buildCreateProjectUnsignedXdr(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: "validation_error",
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});
