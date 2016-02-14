<?php
namespace Slimpd\Playlist;
use Slimpd\Track;
class playlist
{
	protected $relativePath;
	protected $absolutePath;
	protected $filename;
	protected $errorPath = TRUE;
	protected $ext;
	protected $length;
	protected $tracks = [];
	
	public function __construct($relativePath) {
		$app = \Slim\Slim::getInstance();
		foreach([$app->config['mpd']['musicdir'], $app->config['mpd']['alternative_musicdir']] as $path) {
			if(is_file($path . $relativePath) === TRUE) {
				$this->setRelativePath($relativePath);
				$this->setAbsolutePath($path . $relativePath);
				$this->setErrorPath(FALSE);
			}
		}
		
		if($this->getErrorPath() === TRUE) {
			$app->flashNow('error', 'playlist file ' . $relativePath . ' does not exist');
			return $this;
		}
		$this->setFilename(basename($this->getRelativePath()));
		$this->setExt(strtolower(preg_replace('/^.*\./', '', $this->getRelativePath())));
	}
	
	public function fetchTrackRange($minIndex, $maxIndex, $pathOnly = FALSE) {
		$raw = file_get_contents($this->absolutePath);
		
		$itemPaths = array();
		switch($this->getExt()) {
			case 'm3u':
			case 'pls':
			case 'txt':
				// windows generated playlists are not supported yet
				$playlistContent = str_replace("\\", "/", $raw);
				$playlistContent = trimExplode("\n", $playlistContent, TRUE);
				$this->setLength(count($playlistContent));
				foreach($playlistContent as $idx => $itemPath) {
					if($idx < $minIndex || $idx >= $maxIndex) {
						continue;
					}
					$itemPaths[] = $itemPath;
				}
				break;
			case 'nml':
				if($this->isValidXml($raw) === FALSE) {
					$app = \Slim\Slim::getInstance()->flashNow('error', 'invalid XML ' . $this->getFilename());
					return;
				}
				
				$playlistContent = new \SimpleXMLElement($raw);
				$trackEntries = $playlistContent->xpath("//PLAYLIST/ENTRY/LOCATION");
				$this->setLength(count($trackEntries));
				foreach($trackEntries as $idx => $trackEntry) {
					if($idx < $minIndex || $idx >= $maxIndex) {
						continue;
					}
					$itemPaths[] = $trackEntry->attributes()->DIR->__toString() . $trackEntry->attributes()->FILE->__toString();
				}
				break;
			default :
				$app = \Slim\Slim::getInstance()->flashNow('error', 'playlist extension ' . $this->getExt() . ' is not supported');
				return;
		}

		foreach($itemPaths as $itemPath) {
			if($pathOnly === FALSE) {
				$track = \Slimpd\Track::getInstanceByPath($itemPath);
			
				if($track === NULL) {
					$track = new \Slimpd\Track();
					$track->setRelativePath($itemPath);
					$track->setRelativePathHash(getFilePathHash($itemPath));
					$track->setError('notfound');
				}
			} else {
				// increase performance by avoiding any database queries when adding tenthousands of tracks to mpd-playlist
				// TODO: pretty sure we have the pathcheck musicdir/alternative_musicdir somewhere else! find & use it...
				$track = new \Slimpd\Track();
				if(strpos($itemPath, \Slim\Slim::getInstance()->config['mpd']['alternative_musicdir']) === 0) {
					$itemPath = substr($itemPath, strlen(\Slim\Slim::getInstance()->config['mpd']['alternative_musicdir']));
				}
				$track->setRelativePath($itemPath);
				$track->setRelativePathHash(getFilePathHash($itemPath));
				if(is_file(\Slim\Slim::getInstance()->config['mpd']['musicdir'] . $itemPath) === FALSE) {
					$track->setError('notfound');
				}
			}
			$this->appendTrack($track);
		}
	}

	/**
     * checks if the string is parseable as XML
     * 
     */
    public function isValidXml ( $xmlstring ) {
        libxml_use_internal_errors( true );
        $doc = new \DOMDocument('1.0', 'utf-8');
        $doc->loadXML( $xmlstring );
        $errors = libxml_get_errors();
        return empty( $errors );
    }
	
	
	public function setRelativePath($relativePath) {
		$this->relativePath = $relativePath;
	}
	public function getRelativePath() {
		return $this->relativePath;
	}
	
	public function setAbsolutePath($absolutePath) {
		$this->absolutePath = $absolutePath;
	}
	public function getAbsolutePath() {
		return $this->absolutePath;
	}
	
	public function setFilename($filename) {
		$this->filename = $filename;
	}
	public function getFilename() {
		return $this->filename;
	}
	
	public function setErrorPath($errorPath) {
		$this->errorPath = $errorPath;
	}
	public function getErrorPath() {
		return $this->errorPath;
	}
	
	public function setExt($ext) {
		$this->ext = $ext;
	}
	public function getExt() {
		return $this->ext;
	}
	
	public function setLength($length) {
		$this->length = $length;
	}
	public function getLength() {
		return $this->length;
	}
	
	public function appendTrack(\Slimpd\Track $track) {
		$this->tracks[] = $track;
	}
	public function getTracks() {
		return $this->tracks;
	}
}
	