{
  description = "Reproducible development and infrastructure environment for the CV";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/83199d0d373dd3ac2b9a1996b1d0263f76ab7a4c";

  outputs = { nixpkgs, ... }:
    let
      supportedSystems = [
        "aarch64-darwin"
        "x86_64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          platform = {
            aarch64-darwin = "darwin_arm64";
            x86_64-darwin = "darwin_amd64";
            aarch64-linux = "linux_arm64";
            x86_64-linux = "linux_amd64";
          }.${system};
          tofuHashes = {
            aarch64-darwin = "f958ec5e511063be9feb180ca015a4cb7977566a9cf6a8550bba8c2a9b5aba74";
            x86_64-darwin = "44bb1855f372f17f365fb94517906e78da5001da10f4c98de57a39bf982f3a92";
            aarch64-linux = "9bd0228a81bcd0c88f7045c74378f45a815779f19897191dff7d9efba9976b9e";
            x86_64-linux = "50a6106fa4de523d09c87af85f3db1dd47535fc005727fdca6852146476b88ec";
          };
          terragruntHashes = {
            aarch64-darwin = "274c74f30e9d9b72f3c6e6bfdd0758e6d8ece63b961f10d5be7671e3136d40be";
            x86_64-darwin = "e169600ff4a8bb492150c1128e54f409d0dde3691b45d0c0cabf8944755b3937";
            aarch64-linux = "c65d1897446590ebb3c695835cc956c12c5374a9add8312517c83c9fd7a1c06b";
            x86_64-linux = "a2640da8455fa5f3671167e6373832b0907b9dc972dd01c2093cc7808934e158";
          };
          opentofu = pkgs.stdenvNoCC.mkDerivation {
            pname = "opentofu";
            version = "1.12.6";
            src = pkgs.fetchurl {
              url = "https://github.com/opentofu/opentofu/releases/download/v1.12.6/tofu_1.12.6_${platform}.tar.gz";
              sha256 = tofuHashes.${system};
            };
            sourceRoot = ".";
            installPhase = ''
              runHook preInstall
              install -Dm755 tofu $out/bin/tofu
              runHook postInstall
            '';
          };
          terragrunt = pkgs.stdenvNoCC.mkDerivation {
            pname = "terragrunt";
            version = "1.1.4";
            src = pkgs.fetchurl {
              url = "https://github.com/gruntwork-io/terragrunt/releases/download/v1.1.4/terragrunt_${platform}";
              sha256 = terragruntHashes.${system};
            };
            dontUnpack = true;
            installPhase = ''
              runHook preInstall
              install -Dm755 $src $out/bin/terragrunt
              runHook postInstall
            '';
          };
        in
        {
          default = pkgs.mkShell {
            packages = [
              opentofu
              terragrunt
              pkgs.actionlint
              pkgs.jq
              pkgs.s3cmd
              pkgs.nodejs_24
            ];

            ASTRO_TELEMETRY_DISABLED = "1";

            shellHook = ''
              export TMPDIR=/tmp
            '';
          };
        }
      );
    };
}
