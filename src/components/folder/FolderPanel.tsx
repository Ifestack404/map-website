"use client";

import { useEffect } from "react";
import { getFolderAncestry, getFolderById, getFolderChildren } from "@/data/folders";
import { WORLD_FOLDER_ID } from "@/data/continents";
import { useSelectedCountry } from "@/hooks/useCountryInteraction";
import { useWorldNavigation } from "@/state/worldNavigation";
import { Breadcrumb } from "./Breadcrumb";
import { FolderAnimation, FolderPanelMotion } from "./FolderAnimation";
import { FolderItem } from "./FolderItem";
import { CountryInfo } from "@/components/information";

function FolderGlobeBridge() {
  const globeCountry = useSelectedCountry();
  const selectCountry = useWorldNavigation((state) => state.selectCountry);
  const resetNavigation = useWorldNavigation((state) => state.resetNavigation);
  const navCountryId = useWorldNavigation(
    (state) => state.selectedCountry?.id ?? null,
  );
  const isOpen = useWorldNavigation((state) => state.isOpen);

  useEffect(() => {
    if (globeCountry) {
      if (globeCountry.id !== navCountryId) {
        selectCountry(globeCountry);
      }
      return;
    }

    if (isOpen && navCountryId) {
      resetNavigation();
    }
  }, [globeCountry, isOpen, navCountryId, resetNavigation, selectCountry]);

  return null;
}

export function FolderPanel() {
  const isOpen = useWorldNavigation((state) => state.isOpen);
  const currentFolderId = useWorldNavigation((state) => state.currentFolderId);
  const selectedCountry = useWorldNavigation((state) => state.selectedCountry);
  const openFolder = useWorldNavigation((state) => state.openFolder);
  const goBack = useWorldNavigation((state) => state.goBack);
  const resetNavigation = useWorldNavigation((state) => state.resetNavigation);

  const folder = getFolderById(currentFolderId);
  const ancestry = getFolderAncestry(currentFolderId);
  const children = getFolderChildren(currentFolderId);
  const canGoBack = ancestry.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (canGoBack) goBack();
      else resetNavigation();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoBack, goBack, isOpen, resetNavigation]);

  return (
    <>
      <FolderGlobeBridge />

      {!isOpen ? (
        <>
          <button
            type="button"
            onClick={() => openFolder(WORLD_FOLDER_ID)}
            className="pointer-events-auto absolute top-4 left-4 z-20 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-[0.65rem] tracking-[0.22em] text-sky-100/90 uppercase shadow-lg backdrop-blur-md transition-colors hover:border-sky-300/30 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none sm:top-6 sm:left-6"
            aria-label="Open world folder"
          >
            World
          </button>
          <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-center text-xs tracking-wide text-slate-300 backdrop-blur-sm">
            Drag to rotate · Click a country to open its folder
          </p>
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:inset-auto sm:top-6 sm:right-6 sm:bottom-auto sm:left-auto sm:p-0">
        <FolderPanelMotion open={isOpen}>
          <aside
            className="relative max-h-[42vh] w-full overflow-hidden rounded-2xl border border-teal-400/15 bg-slate-950/80 shadow-[0_18px_60px_rgba(2,6,23,0.55),0_0_40px_rgba(45,212,191,0.08)] backdrop-blur-xl sm:max-h-[min(34rem,calc(100dvh-3rem))] sm:w-[22rem]"
            aria-label="World folder explorer"
            aria-live="polite"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 top-1/3 h-36 w-36 rounded-full bg-teal-400/10 blur-3xl"
            />
            <header className="flex items-start gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[0.62rem] font-medium tracking-[0.22em] text-sky-200/75 uppercase">
                  Explorer
                </p>
                <p className="text-[0.58rem] tracking-[0.18em] text-teal-200/50 uppercase">
                  Geographic OS
                </p>
                <Breadcrumb path={ancestry} onOpen={openFolder} />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {canGoBack ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-full px-2 py-1.5 text-[0.65rem] tracking-[0.14em] text-slate-300 uppercase transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
                    aria-label="Go back"
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={resetNavigation}
                  className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
                  aria-label="Close world folder"
                >
                  <span aria-hidden="true" className="block h-4 w-4 text-center leading-4">
                    ×
                  </span>
                </button>
              </div>
            </header>

            <FolderAnimation folderId={currentFolderId}>
              <div className="max-h-[min(28vh,16rem)] overflow-y-auto overscroll-contain px-2 py-2 sm:max-h-[min(26rem,calc(100dvh-9rem))]">
                {folder?.type === "country" ? (
                  <CountryInfo
                    key={folder.id}
                    countryId={folder.id}
                    fallbackName={selectedCountry?.name ?? folder.name}
                  />
                ) : children.length > 0 ? (
                  <ul className="space-y-0.5">
                    {children.map((child) => (
                      <li key={child.id}>
                        <FolderItem
                          folder={child}
                          active={selectedCountry?.id === child.id}
                          onOpen={openFolder}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-400">
                    This folder is empty.
                  </p>
                )}
              </div>
            </FolderAnimation>
          </aside>
        </FolderPanelMotion>
      </div>
    </>
  );
}
