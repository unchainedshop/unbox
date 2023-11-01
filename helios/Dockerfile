FROM ubuntu

RUN apt update && apt install -y curl && \
    curl https://raw.githubusercontent.com/a16z/helios/master/heliosup/install | bash && \
    /root/.helios/bin/heliosup

ENV HELIOS_NETWORK mainnet
ENV HELIOS_EXECUTION_RPC_HOST https://ethereum-mainnet-rpc.allthatnode.com
ENV HELIOS_CONSENSUS_RPC_HOST https://www.lightclientdata.org
ENV HELIOS_CHECKPOINT 0x0e6b8a3d9667d04bd05c3336d86fdcc9c00acbad76000881f1a21f28ea3d5031

EXPOSE 8545

CMD /root/.helios/bin/helios \
    --network $HELIOS_NETWORK \
    --consensus-rpc $HELIOS_CONSENSUS_RPC_HOST \
    --execution-rpc $HELIOS_EXECUTION_RPC_HOST \
    --data-dir /root/.helios/data \
    --checkpoint $HELIOS_CHECKPOINT
