import * as React from "react";
import { ReactNode, useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { DispatchContext } from "../../src/dispatch";
import { CenterColumn, Spacer, TextCenter } from "../core";
import { Button } from "../core/Button";

export function AppHeader() {
  const [modal, setModal] = useState("");
  const openInfo = useCallback(() => setModal("info"), [setModal]);
  const openSettings = useCallback(() => setModal("settings"), [setModal]);
  const close = useCallback(() => setModal(""), [setModal]);
  return (
    <AppHeaderWrap>
      <CircleButton diameter={34} onClick={openInfo}>
        <img src="/assets/info-accent.svg" width={34} height={34} />
      </CircleButton>
      <CircleButton diameter={34} onClick={openSettings}>
        <img src="/assets/settings-accent.svg" width={34} height={34} />
      </CircleButton>
      {modal !== "" && (
        <Modal onClose={close}>
          {modal === "info" && <InfoModal />}
          {modal === "settings" && <SettingsModal />}
        </Modal>
      )}
    </AppHeaderWrap>
  );
}

const AppHeaderWrap = styled.div`
  width: 100%;
  padding: 0 8px;
  display: flex;
  justify-content: space-between;
`;

const CircleButton = styled.button<{ diameter: number }>`
  width: ${(p) => p.diameter + "px"};
  height: ${(p) => p.diameter + "px"};
  border-radius: 99px;
  border: none;
  margin: 0;
  padding: 0;
  background: transparent;
  &:hover {
    background: rgba(252, 210, 112, 0.05);
  }
  &:active {
    background: rgba(252, 210, 112, 0.1);
  }
`;

function Modal(props: { onClose: () => void; children: ReactNode }) {
  return (
    <ModalBg>
      <ModalWrap>
        <CircleButton diameter={20} onClick={props.onClose}>
          <img src="/assets/close-white.svg" width={20} height={20} />
        </CircleButton>
        <Spacer h={32} />
        {props.children}
      </ModalWrap>
    </ModalBg>
  );
}

const ModalBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  backdrop-filter: blur(4px);
`;

const ModalWrap = styled.div`
  background: radial-gradient(circle, #374b49, #2a3231);
  top: 64px;
  left: 0;
  width: 100%;
  max-width: 400px;
  margin: 64px auto 0 auto;
  min-height: 480px;
  padding: 16px;
  border-radius: 12px;
`;

function InfoModal() {
  return (
    <div>
      <Spacer h={32} />
      <TextCenter>
        <img src="/assets/info-primary.svg" width={34} height={34} />
      </TextCenter>
      <Spacer h={32} />
      <CenterColumn w={240}>
        <TextCenter>
          The Zuzalu Passport is a product of 0xPARC. For app support, contact{" "}
          <a href="mailto:passport@0xparc.org">passport@0xparc.org</a>.
        </TextCenter>
        <Spacer h={16} />
        <TextCenter>For event or venue support, contact [TBD].</TextCenter>
      </CenterColumn>
    </div>
  );
}

function SettingsModal() {
  const copySyncKey = useCallback(() => {
    window.alert("Coming soon");
  }, []);

  const [_, dispatch] = useContext(DispatchContext);
  const clearPassport = useCallback(() => {
    if (window.confirm("Are you sure? This will delete your data.")) {
      dispatch({ type: "reset-passport" });
    }
  }, []);

  return (
    <>
      <Spacer h={32} />
      <TextCenter>
        <img src="/assets/settings-primary.svg" width={34} height={34} />
      </TextCenter>
      <Spacer h={32} />
      <CenterColumn w={280}>
        <Button onClick={copySyncKey}>Copy Key for Sync</Button>
        <Spacer h={16} />
        <Button onClick={clearPassport} style="danger">
          Clear Passport
        </Button>
      </CenterColumn>
    </>
  );
}
