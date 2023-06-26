{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import inputs.nixpkgs { inherit system; };
      in rec {
        formatter = pkgs.nixpkgs-fmt;

        packages.nowify = pkgs.writeShellScriptBin "nowify" ''
          set -euo pipefail
          exec ${pkgs.deno}/bin/deno run --allow-read --allow-write --allow-env ${./nowify.ts} -- $@
        '';

        defaultPackage = packages.nowify;

        devShell = pkgs.mkShell { packages = [ pkgs.deno ]; };
      }
    );
}
